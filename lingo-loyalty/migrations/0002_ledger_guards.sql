-- Enforce event/unit compatibility and prohibit negative balances at the database boundary.
CREATE TRIGGER IF NOT EXISTS loyalty_ledger_unit_event_guard
BEFORE INSERT ON loyalty_ledger
WHEN NOT (
  (NEW.unit = 'LINGOCOIN' AND NEW.event_type IN ('AD_REWARD','COUPON_REDEEM','ADMIN_REVERSAL'))
  OR
  (NEW.unit = 'GAME_CREDIT' AND NEW.event_type IN ('GAME_GRANT','GAME_SPEND','ADMIN_REVERSAL'))
)
BEGIN
  SELECT RAISE(ABORT, 'ledger event does not match unit');
END;

CREATE TRIGGER IF NOT EXISTS loyalty_ledger_event_sign_guard
BEFORE INSERT ON loyalty_ledger
WHEN
  (NEW.event_type IN ('AD_REWARD','GAME_GRANT') AND NEW.delta <= 0)
  OR (NEW.event_type = 'GAME_SPEND' AND NEW.delta >= 0)
BEGIN
  SELECT RAISE(ABORT, 'ledger event has invalid delta sign');
END;

CREATE TRIGGER IF NOT EXISTS loyalty_ledger_nonnegative_balance
BEFORE INSERT ON loyalty_ledger
WHEN NEW.delta < 0
 AND COALESCE((SELECT SUM(delta) FROM loyalty_ledger WHERE user_id = NEW.user_id AND unit = NEW.unit), 0) + NEW.delta < 0
BEGIN
  SELECT RAISE(ABORT, 'ledger balance cannot become negative');
END;
