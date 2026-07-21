export const serviceName = 'lingo-community-api';

export function health() {
  return {
    service: serviceName,
    status: 'ok'
  } as const;
}
