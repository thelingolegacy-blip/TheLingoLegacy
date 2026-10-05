import type { TravelOffer, TravelSearchRequest } from "./types";
import type { SupplierAdapter } from "./supplier";

export async function searchTravel(request: TravelSearchRequest, suppliers: SupplierAdapter[]): Promise<TravelOffer[]> {
  const responses = await Promise.allSettled(suppliers.map((supplier) => supplier.search(request)));
  const offers = responses.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  return offers
    .filter((offer) => offer.bookable && new Date(offer.expiresAt).getTime() > Date.now())
    .sort((a, b) => a.totalAmount - b.totalAmount);
}
