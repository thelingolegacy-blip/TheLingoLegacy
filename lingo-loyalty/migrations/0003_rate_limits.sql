CREATE TABLE IF NOT EXISTS loyalty_rate_limits (
  user_id TEXT NOT NULL,
  route TEXT NOT NULL CHECK (route IN ('wallet_read','ad_reward','game_grant','game_spend','coupon_redeem')),
  window_start TEXT NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 1),
  PRIMARY KEY (user_id, route, window_start)
);
CREATE INDEX IF NOT EXISTS idx_loyalty_rate_limits_window
  ON loyalty_rate_limits(window_start);