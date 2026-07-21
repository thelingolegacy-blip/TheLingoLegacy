export interface RouteIntentInput {
  userId?: string | null;
  intent: string;
  context?: Record<string, unknown>;
}

export interface RouteIntentResult {
  assistant: 'ask-lingo';
  intent: string;
  response: string;
  context?: Record<string, unknown>;
}

export async function routeIntent({ intent, context }: RouteIntentInput): Promise<RouteIntentResult> {
  return {
    assistant: 'ask-lingo',
    intent,
    response: 'Ask Lingo received the request and is ready to route it across the Lingo Legacy ecosystem.',
    context
  };
}
