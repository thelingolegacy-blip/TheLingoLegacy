import pathlib
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parents[2]
SQL = (ROOT / 'migrations/0001_lingo_game_wallet_staging.sql').read_text()


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
    db.commit()
    assert db.execute("SELECT credits_units FROM lingo_game_wallets WHERE firebase_uid='firebase-user-1'").fetchone()[0] == 110
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
    print('SLOT_WALLET_MIGRATION_SQLITE=PASS')
    print('ATOMIC_LEDGER_AND_WALLET_TRIGGER=PASS')
    print('OVERDRAFT_ROLLBACK=PASS')
    print('APPEND_ONLY_LEDGER=PASS')


if __name__ == '__main__':
    main()
