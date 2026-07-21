export interface LingoSession {
  userId: string;
  roles: string[];
}

export function useLingoSession(): LingoSession | null {
  return null;
}
