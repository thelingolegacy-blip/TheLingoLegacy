import { db, json, error } from '@appdeploy/sdk';
import { notifySubscribers } from './realtime-subscribers';

const now = () => new Date().toISOString();
const filterFor = (entity_type: string, entity_id: string) => ({ entity_type, entity_id });

export async function readRuntime(entity_type: string, entity_id: string) {
    const { items } = await db.list('runtime_entities', {
        filter: filterFor(entity_type, entity_id),
        limit: 1,
    });
    return items[0] ?? null;
}

export async function writeRuntime(
    entity_type: string,
    entity_id: string,
    state: Record<string, unknown>,
) {
    const current = await readRuntime(entity_type, entity_id);
    const updated_at = now();

    if (current) {
        const ok = (
            await db.update('runtime_entities', [
                { id: current.id, record: { ...current, state, updated_at } },
            ])
        )[0];
        if (!ok) return error('Runtime state update failed', 500);
        await notifySubscribers(entity_type, entity_id, state);
        return json({ entity_type, entity_id, state });
    }

    const [id] = await db.add('runtime_entities', [
        { entity_type, entity_id, state, updated_at },
    ]);
    if (!id) return error('Runtime state creation failed', 500);
    await notifySubscribers(entity_type, entity_id, state);
    return json({ id, entity_type, entity_id, state });
}

export async function recordEvent(input: {
    event: string;
    entity_type: string;
    entity_id: string;
    payload?: Record<string, unknown>;
    timestamp?: string;
}) {
    const timestamp = input.timestamp ?? now();
    const payload = input.payload ?? {};
    const [id] = await db.add('runtime_events', [
        { ...input, payload, timestamp },
    ]);
    if (!id) return error('Event persistence failed', 500);

    await notifySubscribers(input.entity_type, input.entity_id, {
        type: 'event',
        event: input.event,
        event_id: id,
        payload,
        timestamp,
    });
    return json({ event_id: id, event: input.event });
}

export async function publish(entity_type: string, entity_id: string) {
    const timestamp = now();
    const [id] = await db.add('runtime_events', [
        { event: 'PUBLISH_REQUESTED', entity_type, entity_id, state: 'PUBLISHED', timestamp },
    ]);
    if (!id) return error('Publish failed', 500);

    await notifySubscribers(entity_type, entity_id, {
        type: 'published',
        entity_type,
        entity_id,
        timestamp,
    });
    return json({ published: true, event_id: id });
}
