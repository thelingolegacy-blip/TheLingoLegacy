import { createBooking } from "./booking";
import type { SupplierAdapter } from "./supplier";
import type { Booking, TravelOffer } from "./types";

const offer: TravelOffer = {
  offerId: "offer-1", supplierId: "supplier-1", product: "flight", currency: "USD",
  totalAmount: 250, expiresAt: new Date(Date.now() + 60_000).toISOString(), sourceOfferId: "source-1", bookable: true, metadata: {},
};

const booking: Booking = {
  bookingId: "booking-1", travelerId: "traveler-1", offerId: offer.offerId, supplierId: offer.supplierId,
  status: "quoted", currency: "USD", quotedAmount: 250, updatedAt: new Date().toISOString(), auditId: "audit-1",
};

function supplier(overrides: Partial<SupplierAdapter> = {}): SupplierAdapter {
  return {
    supplierId: "supplier-1", version: "v1",
    authenticate: async () => {}, healthCheck: async () => "healthy",
    search: async () => [offer], revalidate: async (value) => value,
    hold: async () => ({ holdId: "hold-1", expiresAt: new Date(Date.now() + 60_000).toISOString() }),
    book: async () => ({ confirmationId: "CONF-1", amount: 250, currency: "USD" }),
    cancel: async () => ({ cancelled: true }),
    verify: async () => ({ status: "confirmed", amount: 250 }), disconnect: async () => {},
    ...overrides,
  };
}

describe("travel booking", () => {
  it("requires revalidation before confirmation", async () => {
    await expect(createBooking({ booking, offer, travelerId: "traveler-1", supplier: supplier({ revalidate: async () => ({ ...offer, bookable: false }) }), paymentReference: "pay-1", environment: "staging", mode: "assist" })).rejects.toThrow("QUOTE_CHANGED_OR_UNAVAILABLE");
  });

  it("requires verified supplier confirmation", async () => {
    await expect(createBooking({ booking, offer, travelerId: "traveler-1", supplier: supplier({ verify: async () => ({ status: "unknown" }) }), paymentReference: "pay-1", environment: "staging", mode: "assist" })).rejects.toThrow("BOOKING_VERIFICATION_unknown");
  });

  it("does not autonomously book production", async () => {
    await expect(createBooking({ booking, offer, travelerId: "traveler-1", supplier: supplier(), paymentReference: "pay-1", environment: "production", mode: "controlled_auto" })).rejects.toThrow("BOOKING_POLICY_REQUIRE_APPROVAL");
  });
});
