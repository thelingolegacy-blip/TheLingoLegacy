export interface ThinQNotificationResult {
  status: 'sent';
  message: string;
}

export function sendThinQNotification(message: string): ThinQNotificationResult {
  return {
    status: 'sent',
    message
  };
}
