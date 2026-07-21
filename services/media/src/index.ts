export const serviceName = 'lingo-media-api';

export function health() {
  return {
    service: serviceName,
    status: 'ok'
  } as const;
}
