export const serviceName = 'lingo-games-api';

export function health() {
  return {
    service: serviceName,
    status: 'ok'
  } as const;
}
