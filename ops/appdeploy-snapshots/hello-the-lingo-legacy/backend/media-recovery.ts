import { db, json, error } from '@appdeploy/sdk';
import { notifySubscribers } from './realtime-subscribers';

const VERSIONS = 'media_asset_versions';
const AUDIT = 'media_audit_events';
const FAILURE_THRESHOLD = 3;
const now = () => new Date().toISOString();

type Version = { id: string; asset_id: string; version_id: string; app_id: string; universe_id: string; state: string; approved_at?: string; published_at?: string; activated_at?: string; failure_count?: number; health_state?: string; last_health_at?: string; };
type HealthBody = { version_id?: string; app_id?: string; universe_id?: string; ok?: boolean; reason?: string };
type RollbackBody = { current_version_id?: string; app_id?: string; universe_id?: string };

async function audit(event: string, record: Omit<Version, 'id'>, metadata: Record<string, unknown> = {}) {
    const [id] = await db.add(AUDIT, [{ event, asset_id: record.asset_id, version_id: record.version_id, app_id: record.app_id, universe_id: record.universe_id, actor: 'recovery-controller', timestamp: now(), resulting_state: record.state, metadata }]);
    return id;
}

async function versionsFor(assetId: string) {
    const { items } = await db.list<Version>(VERSIONS, { filter: { asset_id: assetId }, limit: 100 });
    return items;
}

async function current(assetId: string, versionId?: string) {
    const items = await versionsFor(assetId);
    return items.find(item => versionId ? item.version_id === versionId : item.state === 'ACTIVE' || item.state === 'FROZEN') ?? null;
}

async function previousApproved(assetId: string, currentVersionId: string) {
    const items = await versionsFor(assetId);
    return items.filter(item => item.version_id !== currentVersionId && item.state === 'APPROVED' && item.published_at).sort((a, b) => String(b.approved_at ?? '').localeCompare(String(a.approved_at ?? '')))[0] ?? null;
}

async function recover(assetId: string, currentVersionId: string, appId: string, universeId: string, reason: string) {
    const active = await current(assetId, currentVersionId);
    if (!active || active.version_id !== currentVersionId) return { recovered: false, reason: 'Current version mismatch' };
    if (Number(active.failure_count ?? 0) < FAILURE_THRESHOLD && active.state !== 'FROZEN') return { recovered: false, reason: 'Recovery threshold not reached' };
    const previous = await previousApproved(assetId, currentVersionId);
    if (!previous) return { recovered: false, reason: 'No approved and published predecessor available' };
    const retired = { ...active, state: 'ROLLED_BACK', rolled_back_at: now() };
    const restored = { ...previous, state: 'ACTIVE', activated_at: now(), failure_count: 0, health_state: 'HEALTHY' };
    const [retiredOk] = await db.update(VERSIONS, [{ id: active.id, record: retired }]);
    if (!retiredOk) return { recovered: false, reason: 'Failed to freeze current version for rollback' };
    const [restoredOk] = await db.update(VERSIONS, [{ id: previous.id, record: restored }]);
    if (!restoredOk) return { recovered: false, reason: 'Failed to activate approved predecessor' };
    const auditId = await audit('ASSET_ROLLED_BACK', restored, { from_version_id: currentVersionId, reason, app_id: appId, universe_id: universeId });
    await notifySubscribers('asset', assetId, { event: 'ASSET_ROLLED_BACK', active_version_id: previous.version_id, from_version_id: currentVersionId });
    return { recovered: true, active_version_id: previous.version_id, audit_event_id: auditId };
}

export async function automatedMediaHealthMonitor() {
    const { items } = await db.list<Version>(VERSIONS, { filter: { state: 'FROZEN' }, limit: 100 });
    let recovered = 0;
    for (const item of items) {
        if (!item.asset_id || !item.version_id || !item.app_id || !item.universe_id) continue;
        const result = await recover(item.asset_id, item.version_id, item.app_id, item.universe_id, 'automated-health-monitor');
        if (result.recovered) recovered += 1;
    }
    return { statusCode: 200, recovered, inspected: items.length };
}

export const mediaRecoveryRoutes = {
    'POST /api/media/health/:asset_id': [async ({ params, body }) => {
        const input = (body ?? {}) as HealthBody;
        if (!input.version_id || !input.app_id || !input.universe_id || typeof input.ok !== 'boolean') return error('version_id, app_id, universe_id and ok are required', 400);
        const currentVersion = await current(params.asset_id, input.version_id);
        if (!currentVersion || currentVersion.version_id !== input.version_id || (currentVersion.state !== 'ACTIVE' && currentVersion.state !== 'FROZEN')) return error('Current active version mismatch', 409);
        const failures = input.ok ? 0 : Number(currentVersion.failure_count ?? 0) + 1;
        const state = input.ok ? 'ACTIVE' : failures >= FAILURE_THRESHOLD ? 'FROZEN' : 'ACTIVE';
        const healthState = input.ok ? 'HEALTHY' : failures >= FAILURE_THRESHOLD ? 'FAILED' : 'DEGRADED';
        const updated = { ...currentVersion, state, failure_count: failures, health_state: healthState, last_health_at: now() };
        const [ok] = await db.update(VERSIONS, [{ id: currentVersion.id, record: updated }]);
        if (!ok) return error('Health state update failed', 500);
        const auditId = await audit('ASSET_HEALTH_' + (input.ok ? 'PASSED' : 'FAILED'), updated, { reason: input.reason ?? null, failure_count: failures });
        if (state === 'FROZEN') await notifySubscribers('asset', params.asset_id, { event: 'ASSET_FROZEN', version_id: currentVersion.version_id, failure_count: failures });
        return json({ ok: true, state, health_state: healthState, failure_count: failures, audit_event_id: auditId });
    }],
    'POST /api/media/recovery/:asset_id': [async ({ params, body }) => {
        const input = (body ?? {}) as RollbackBody;
        if (!input.current_version_id || !input.app_id || !input.universe_id) return error('current_version_id, app_id and universe_id are required', 400);
        const result = await recover(params.asset_id, input.current_version_id, input.app_id, input.universe_id, 'manual-recovery');
        if (!result.recovered) return error(result.reason ?? 'Recovery failed', 409);
        return json(result);
    }],
    'GET /api/media/audit/:asset_id': [async ({ params }) => {
        const { items } = await db.list(AUDIT, { filter: { asset_id: params.asset_id }, limit: 100 });
        return json(items);
    }],
};
