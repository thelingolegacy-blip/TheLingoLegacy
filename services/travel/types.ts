export type Environment = "dev" | "staging" | "production";
export type TravelProduct = "flight" | "hotel" | "car" | "cruise" | "package";
export type BookingStatus = "draft" | "quoted" | "held" | "payment_pending" | "confirmed" | "changed" | "cancelled" | "failed";
export type SupplierStatus = "healthy" | "degraded" | "offline";

export interface TravelSearchRequest {
  product: TravelProduct;
  origin?: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  travelers: number;
  currency: string;
}

export interface TravelOffer {
  offerId: string;
  supplierId: string;
  product: TravelProduct;
  currency: string;
  totalAmount: number;
  expiresAt: string;
  sourceOfferId: string;
  bookable: boolean;
  metadata: Record<string, unknown>;
}

export interface Booking {
  bookingId: string;
  travelerId: string;
  offerId: string;
  supplierId: string;
  status: BookingStatus;
  currency: string;
  quotedAmount: number;
  confirmedAmount?: number;
  supplierConfirmation?: string;
  paymentReference?: string;
  itineraryId?: string;
  updatedAt: string;
  auditId: string;
}

export interface BookingDiff {
  field: string;
  expected: unknown;
  supplier: unknown;
  observed: unknown;
  severity: "low" | "medium" | "high" | "critical";
}
