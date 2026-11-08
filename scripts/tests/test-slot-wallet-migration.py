import pathlib
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parents[2]
SQL = (ROOT / 'migrations/0001_lingo_game_wallet_staging.sql').read_text()
RATE_LIMIT_SQL = (ROOT / 'migrations/0002_lingo_api_rate_limits_staging.sql').read_text()


def expect_integrity_error(connection, statement, params, expected):
    try:
        connection.execute(statement, params)
    except sqlite3.IntegrityError as error:
        assert expected in str(error), str(error)
    else:
        raise AssertionError(f'expected {expected}')


def main():
    db = sqlite3.connect(':memory:')
    db.executescript(SQL)
    db.executescript(SQL)  # migration is re-runnable
    db.executescript(RATE_LIMIT_SQL)
    db.executescript(RATE_LIMIT_SQL)  # rate-limit migration is re-runnable
    db.execute("INSERT INTO lingo_game_accounts(firebase_uid) VALUES (?)", ('firebase-user-1',))
    db.execute("INSERT INTO lingo_game_wallets(firebase_uid, credits_units) VALUES (?, ?)", ('firebase-user-1', 100))
    db.commit()

    db.execute('BEGIN')
    db.execute("""INSERT INTO lingo_game_sessions
      (session_id, firebase_uid, game_id, idempotency_key, rule_version, reels_json, wager_units, payout_units, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')""",
      ('session-1', 'firebase-user-1', 'thats-my-lingo', 'idempotency-key-0001', 'rules-v1', '["LION","LION","LION"]', 10, 20))
    db.execute("INSERT INTO lingo_wallet_ledger(event_id, session_id, firebase_uid, event_type, delta_units) VALUES (?, ?, ?, ?, ?)",
      ('session-1:debit', 'session-1', 'firebase-user-1', 'slot_wager_debit', -10))
    db.execute("INSERT INTO lingo_wallet_ledger(event_id, session_id, firebase_uid, event_type, delta_units) VALUES (?, ?, ?, ?, ?)",
      ('session-1:payout', 'session-1', 'firebase-user-1', 'slot_payout_credit', 20))
    db.execute("UPDATE lingo_game_sessions SET status='settled', balance_after_units=(SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?) WHERE session_id=?", ('firebase-user-1', 'session-1'))
    db.execute("UPDATE lingo_game_wallets SET xp_units=xp_units+100 WHERE firebase_uid=?", ('firebase-user-1',))
    db.execute("UPDATE lingo_game_progression SET xp_units=xp_units+100, level=CAST((xp_units+100)/250 AS INTEGER)+1 WHERE firebase_uid=?", ('firebase-user-1',))
    db.commit()
    assert db.execute("SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid='firebase-user-1'").fetchone() == (110, 100)
    assert db.execute("SELECT xp_units,level FROM lingo_game_progression WHERE firebase_uid='firebase-user-1'").fetchone() == (100, 1)
    assert db.execute("SELECT balance_after_units FROM lingo_game_sessions WHERE session_id='session-1'").fetchone()[0] == 110

    # Failed wager transaction rolls back the pending session and all writes.
    try:
        db.execute('BEGIN')
        db.execute("""INSERT INTO lingo_game_sessions
          (session_id, firebase_uid, game_id, idempotency_key, rule_version, reels_json, wager_units, payout_units, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')""",
          ('session-2', 'firebase-user-1', 'thats-my-lingo', 'idempotency-key-0002', 'rules-v1', '["SEVEN","SEVEN","SEVEN"]', 1000, 0))
        db.execute("INSERT INTO lingo_wallet_ledger(event_id, session_id, firebase_uid, event_type, delta_units) VALUES (?, ?, ?, ?, ?)",
          ('session-2:debit', 'session-2', 'firebase-user-1', 'slot_wager_debit', -1000))
        raise AssertionError('overdraft unexpectedly succeeded')
    except sqlite3.IntegrityError as error:
        assert 'INSUFFICIENT_FUNDS' in str(error)
        db.rollback()
    assert db.execute("SELECT COUNT(*) FROM lingo_game_sessions WHERE session_id='session-2'").fetchone()[0] == 0
    assert db.execute("SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid='firebase-user-1'").fetchone()[0] == 110

    expect_integrity_error(db, "UPDATE lingo_wallet_ledger SET delta_units=999 WHERE event_id='session-1:debit'", (), 'LEDGER_IS_APPEND_ONLY')
    expect_integrity_error(db, "DELETE FROM lingo_wallet_ledger WHERE event_id='session-1:debit'", (), 'LEDGER_IS_APPEND_ONLY')
    expect_integrity_error(db, "INSERT INTO lingo_wallet_ledger(event_id, session_id, firebase_uid, event_type, delta_units) VALUES (?, ?, ?, ?, ?)",
      ('session-1:debit-duplicate', 'session-1', 'firebase-user-1', 'slot_wager_debit', -1), 'UNIQUE')
    # Staging welcome grant is a one-time, auditable admin_adjustment event.
    grant_uid = 'firebase-user-2'
    grant_session = 'welcome-grant:' + grant_uid
    db.execute("INSERT OR IGNORE INTO lingo_game_accounts(firebase_uid) VALUES (?)", (grant_uid,))
    db.execute("INSERT OR IGNORE INTO lingo_game_wallets(firebase_uid) VALUES (?)", (grant_uid,))
    db.execute("INSERT OR IGNORE INTO lingo_game_progression(firebase_uid) VALUES (?)", (grant_uid,))
    def apply_welcome_grant():
        db.execute("""INSERT OR IGNORE INTO lingo_game_sessions
          (session_id, firebase_uid, game_id, idempotency_key, rule_version, reels_json, wager_units, payout_units, status)
          VALUES (?, ?, 'system-demo-coin-grant', 'welcome-demo-coin-grant-v1', 'welcome-demo-coin-v1', ?, 5000, 5000, 'pending')""",
          (grant_session, grant_uid, '{"kind":"welcome_demo_coin_grant","grantUnits":5000,"redeemable":false}'))
        db.execute("""INSERT OR IGNORE INTO lingo_wallet_ledger
          (event_id, session_id, firebase_uid, event_type, delta_units)
          VALUES (?, ?, ?, 'admin_adjustment', 5000)""", (grant_session, grant_session, grant_uid))
        db.execute("""UPDATE lingo_game_sessions
          SET status='settled', balance_after_units=(SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?)
          WHERE session_id=? AND firebase_uid=? AND status='pending'""", (grant_uid, grant_session, grant_uid))
    apply_welcome_grant()
    db.commit()
    assert db.execute("SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?", (grant_uid,)).fetchone()[0] == 5000
    apply_welcome_grant()
    db.commit()
    assert db.execute("SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?", (grant_uid,)).fetchone()[0] == 5000
    assert db.execute("SELECT balance_after_units FROM lingo_game_sessions WHERE session_id=?", (grant_session,)).fetchone()[0] == 5000

    print('SLOT_WALLET_MIGRATION_SQLITE=PASS')
    print('ATOMIC_LEDGER_AND_WALLET_TRIGGER=PASS')
    print('OVERDRAFT_ROLLBACK=PASS')
    print('APPEND_ONLY_LEDGER=PASS')
    print('ONE_TIME_WELCOME_DEMO_COIN_GRANT=PASS')
    # Server daily reward is one idempotent ledger grant per UTC date.
    daily_uid = 'firebase-user-3'
    daily_session = 'daily-session-1'
    db.execute("INSERT OR IGNORE INTO lingo_game_accounts(firebase_uid) VALUES (?)", (daily_uid,))
    db.execute("INSERT OR IGNORE INTO lingo_game_wallets(firebase_uid) VALUES (?)", (daily_uid,))
    db.execute("INSERT OR IGNORE INTO lingo_game_progression(firebase_uid) VALUES (?)", (daily_uid,))
    def apply_daily_reward():
        existing = db.execute("SELECT session_id FROM lingo_game_sessions WHERE firebase_uid=? AND idempotency_key=?", (daily_uid, 'daily-demo-reward-2026-11-08')).fetchone()
        if existing:
            return
        db.execute("""INSERT INTO lingo_game_sessions
          (session_id, firebase_uid, game_id, idempotency_key, rule_version, reels_json, wager_units, payout_units, status)
          VALUES (?, ?, 'system-daily-reward', 'daily-demo-reward-2026-11-08', 'daily-demo-reward-v1', ?, 1, 500, 'pending')""",
          (daily_session, daily_uid, '{"kind":"daily_demo_reward","claimDate":"2026-11-08","rewardUnits":500,"xpAwardUnits":150,"redeemable":false}'))
        db.execute("""INSERT INTO lingo_wallet_ledger
          (event_id, session_id, firebase_uid, event_type, delta_units)
          VALUES (?, ?, ?, 'admin_adjustment', 500)""", (daily_session + ':daily-reward', daily_session, daily_uid))
        db.execute("""UPDATE lingo_game_sessions
          SET status='settled', balance_after_units=(SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid=?)
          WHERE session_id=? AND firebase_uid=? AND status='pending'""", (daily_uid, daily_session, daily_uid))
        db.execute("UPDATE lingo_game_wallets SET xp_units=xp_units+150 WHERE firebase_uid=?", (daily_uid,))
        db.execute("UPDATE lingo_game_progression SET xp_units=xp_units+150, level=CAST((xp_units+150)/250 AS INTEGER)+1 WHERE firebase_uid=?", (daily_uid,))
    apply_daily_reward()
    db.commit()
    apply_daily_reward()
    db.commit()
    assert db.execute("SELECT credits_units,xp_units FROM lingo_game_wallets WHERE firebase_uid=?", (daily_uid,)).fetchone() == (500, 150)
    assert db.execute("SELECT xp_units,level FROM lingo_game_progression WHERE firebase_uid=?", (daily_uid,)).fetchone() == (150, 1)
    print('IDEMPOTENT_DAILY_DEMO_REWARD=PASS')

    # Atomic per-UID fixed-window rate-limit upsert: 60 accepted, 61st rejected.
    def consume_rate_limit(uid, now_ms):
        row = db.execute(
            """INSERT INTO lingo_api_rate_limits(firebase_uid,window_epoch,request_count) VALUES(?,?,1)
            ON CONFLICT(firebase_uid) DO UPDATE SET window_epoch=excluded.window_epoch,
              request_count=CASE WHEN lingo_api_rate_limits.window_epoch=excluded.window_epoch
                THEN lingo_api_rate_limits.request_count+1 ELSE 1 END,
              updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') RETURNING request_count""",
            (uid, now_ms // 60000),
        ).fetchone()
        return row[0] <= 60
    assert all(consume_rate_limit('firebase-user-1', 1_800_000_000_000) for _ in range(60))
    assert consume_rate_limit('firebase-user-1', 1_800_000_000_000) is False
    assert consume_rate_limit('firebase-user-1', 1_800_000_060_000) is True
    print('PER_USER_FIXED_WINDOW_RATE_LIMIT=PASS')


if __name__ == '__main__':
    main()
