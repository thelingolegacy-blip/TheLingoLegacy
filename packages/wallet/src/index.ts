export interface WalletBalance {
  loyaltyBucks: number;
  xp: number;
  rewards: string[];
}

export const emptyWallet: WalletBalance = {
  loyaltyBucks: 0,
  xp: 0,
  rewards: []
};
