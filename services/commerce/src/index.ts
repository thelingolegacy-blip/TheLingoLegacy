export const serviceName = 'lingo-commerce-api';

export function health() {
  return {
    service: serviceName,
    status: 'ok'
  } as const;
}
