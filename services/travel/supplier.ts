import type { TravelOffer, TravelSearchRequest, SupplierStatus } from "./types";

export interface SupplierAdapter {
  supplierId: string;
  version: string;
  authenticate(): Promise<void>;
  healthCheck(): Promise<SupplierStatus>;
  search(request: TravelSearchRequest): Promise<TravelOffer[]>;
  revalidate(offer: TravelOffer): Promise<TravelOffer>;
  hold(offer: TravelOffer): Promise<{ holdId: string; expiresAt: string }>;
  book(input: { holdId: string; travelerId: string; paymentReference: string }): Promise<{ confirmationId: string; amount: number; currency: string }>;
  cancel(input: { confirmationId: string }): Promise<{ cancelled: boolean }>;
  verify(input: { confirmationId: string }): Promise<{ status: "confirmed" | "changed" | "cancelled" | "unknown"; amount?: number }>;
  disconnect(): Promise<void>;
}
