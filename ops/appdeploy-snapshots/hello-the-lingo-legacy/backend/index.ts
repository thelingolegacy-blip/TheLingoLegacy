import { router, json } from '@appdeploy/sdk';
import { readRuntime, writeRuntime, recordEvent, publish } from './runtime-fabric';
import { getAppRegistry } from './app-registry';
import { getExperienceContract } from './experience-contracts';
import { mediaRecoveryRoutes, automatedMediaHealthMonitor } from './media-recovery';
import { realtimeSubscriptionRoutes } from './realtime-subscribers';

export const handler = router({
    'GET /api/studio': [
        async () => {
            const runtime = await readRuntime('studio', 'global');
            const state = runtime?.state;
            if (state && typeof state === 'object' && !Array.isArray(state)) {
                return json(state);
            }
            return json({
                pages: [],
                modules: [],
                media: [],
                products: [],
                tap_stitch: [],
            });
        },
    ],
    'GET /api/registry': [async () => getAppRegistry()],
    'GET /api/experience/:app_id': [
        async ({ params }) => getExperienceContract(params.app_id),
    ],
    'GET /api/runtime/:entity_type/:entity_id': [
        async ({ params }) => json(await readRuntime(params.entity_type, params.entity_id)),
    ],
    'POST /api/runtime/:entity_type/:entity_id': [
        async ({ params, body }) => {
            if (!body || typeof body !== 'object' || Array.isArray(body)) {
                return json({ error: 'Runtime state object required' }, 400);
            }
            return writeRuntime(params.entity_type, params.entity_id, body);
        },
    ],
    'POST /api/events': [
        async ({ body }) => {
            if (!body || typeof body !== 'object' || Array.isArray(body)) {
                return json({ error: 'Event object required' }, 400);
            }
            const input = body as {
                event?: string;
                entity_type?: string;
                entity_id?: string;
                payload?: Record<string, unknown>;
                timestamp?: string;
            };
            if (!input.event || !input.entity_type || !input.entity_id) {
                return json({ error: 'event, entity_type and entity_id are required' }, 400);
            }
            return recordEvent({
                event: input.event,
                entity_type: input.entity_type,
                entity_id: input.entity_id,
                payload: input.payload,
                timestamp: input.timestamp,
            });
        },
    ],
    'POST /api/tap-stitch/event': [
        async ({ body }) => {
            if (!body || typeof body !== 'object' || Array.isArray(body)) {
                return json({ error: 'Tap Stitch event object required' }, 400);
            }
            const input = body as { event?: string; source?: string };
            if (!input.event) return json({ error: 'event is required' }, 400);
            return recordEvent({
                event: input.event,
                entity_type: 'tap-stitch',
                entity_id: input.source || 'studio',
                payload: { source: input.source || 'studio' },
            });
        },
    ],
    'POST /api/publish/:entity_type/:entity_id': [
        async ({ params }) => publish(params.entity_type, params.entity_id),
    ],
    ...realtimeSubscriptionRoutes,
    ...mediaRecoveryRoutes,
});

export const automatedHealthMonitor = async () => automatedMediaHealthMonitor();
