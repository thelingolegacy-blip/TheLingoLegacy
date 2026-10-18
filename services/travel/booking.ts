import type { Booking, TravelOffer } from "./types";
import type { SupplierAdapter } from "./supplier";
import { localTravelPolicy } from "./policy";

export async function createBooking(input: {
  booking: Booking;
  offer: TravelOffer;
  travelerId: string;
  supplier: SupplierAdapter;
  paymentReference: string;
  environment: "dev" | "staging" | "production";
  mode: "observe" | "assist" | "controlled_auto" | "emergency";
}): Promise<Booking> {
  const decision = localTravelPolicy({ environment: input.environment, operation: "book", amount: input.offer.totalAmount, mode: input.mode });
  if (decision !== "ALLOW") throw new Error(`BOOKING_POLICY_${decision}`);

  const currentOffer = await input.supplier.revalidate(input.offer);
  if (!currentOffer.bookable || currentOffer.totalAmount !== input.booking.quotedAmount) {
    throw new Error("QUOTE_CHANGED_OR_UNAVAILABLE");
  }

  const hold = await input.supplier.hold(currentOffer);
  const confirmation = await input.supplier.book({ holdId: hold.holdId, travelerId: input.travelerId, paymentReference: input.paymentReference });
  const verified = await input.supplier.verify({ confirmationId: confirmation.confirmationId });

  if (verified.status !== "confirmed") throw new Error(`BOOKING_VERIFICATION_${verified.status}`);

  return {
    ...input.booking,
    status: "confirmed",
    confirmedAmount: confirmation.amount,
    supplierConfirmation: confirmation.confirmationId,
    paymentReference: input.paymentReference,
    updatedAt: new Date().toISOString(),
  };
}
