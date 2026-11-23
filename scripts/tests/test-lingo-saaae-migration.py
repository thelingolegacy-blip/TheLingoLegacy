import pathlib
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parents[2]
SQL = (ROOT / 'migrations/0002_lingo_saaae_staging.sql').read_text()


def expect_integrity_error(db, statement, params, expected=None):
    try:
        db.execute(statement, params)
    except sqlite3.IntegrityError as error:
        if expected:
            assert expected in str(error), str(error)
    else:
        raise AssertionError(f'expected integrity failure: {statement}')


def main():
    db = sqlite3.connect(':memory:')
    db.execute('PRAGMA foreign_keys = ON')
    db.executescript(SQL)
    db.executescript(SQL)  # additive migration must be re-runnable

    db.execute("INSERT INTO lingo_saaae_principals(firebase_uid) VALUES ('user-1')")
    db.execute("INSERT INTO lingo_saaae_principals(firebase_uid) VALUES ('approver-1')")
    db.execute("""INSERT INTO lingo_saaae_tenant_memberships
      (membership_id, firebase_uid, tenant_id) VALUES ('membership-1', 'user-1', 'tenant-1')""")
    db.execute("""INSERT INTO lingo_saaae_grants
      (grant_id, firebase_uid, tenant_id, product_id, resource_id, operation, created_by)
      VALUES ('grant-1', 'user-1', 'tenant-1', 'thats-my-lingo', 'wallet:user-1', 'read', 'approver-1')""")

    # Grants cannot be created without an exact tenant membership.
    expect_integrity_error(db, """INSERT INTO lingo_saaae_grants
      (grant_id, firebase_uid, tenant_id, product_id, resource_id, operation, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)""",
      ('grant-bad', 'user-1', 'tenant-other', 'thats-my-lingo', 'wallet:user-1', 'read', 'approver-1'))

    # Approval records enforce separation of duties and a consistent consume state.
    expect_integrity_error(db, """INSERT INTO lingo_saaae_approvals
      (approval_id, tenant_id, product_id, resource_id, operation, action_digest,
       requester_uid, approver_uid, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
      ('approval-self', 'tenant-1', 'thats-my-lingo', 'spin:user-1', 'spin', 'digest',
       'user-1', 'user-1', '2099-01-01T00:00:00Z'))
    expect_integrity_error(db, """INSERT INTO lingo_saaae_approvals
      (approval_id, tenant_id, product_id, resource_id, operation, action_digest,
       requester_uid, approver_uid, status, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'consumed', ?)""",
      ('approval-invalid', 'tenant-1', 'thats-my-lingo', 'spin:user-1', 'spin', 'digest',
       'user-1', 'approver-1', '2099-01-01T00:00:00Z'))

    db.execute("""INSERT INTO lingo_saaae_approvals
      (approval_id, tenant_id, product_id, resource_id, operation, action_digest,
       requester_uid, approver_uid, expires_at)
      VALUES ('approval-1', 'tenant-1', 'thats-my-lingo', 'spin:user-1', 'spin',
       'sha256:request-digest', 'user-1', 'approver-1', '2099-01-01T00:00:00Z')""")

    db.execute("""INSERT INTO lingo_saaae_audit_events
      (event_id, correlation_id, actor_uid, tenant_id, product_id, resource_id,
       operation, decision, reason_code)
      VALUES ('event-1', 'corr-1', 'user-1', 'tenant-1', 'thats-my-lingo',
       'wallet:user-1', 'read', 'deny', 'NO_MATCHING_GRANT')""")
    expect_integrity_error(db, "UPDATE lingo_saaae_audit_events SET reason_code='tampered' WHERE event_id='event-1'", (), 'SAAAE_AUDIT_IS_APPEND_ONLY')
    expect_integrity_error(db, "DELETE FROM lingo_saaae_audit_events WHERE event_id='event-1'", (), 'SAAAE_AUDIT_IS_APPEND_ONLY')

    db.execute("""INSERT INTO lingo_saaae_rate_limit_buckets
      (bucket_key, firebase_uid, route_key, window_start_epoch, request_count)
      VALUES ('user-1:spin:1000', 'user-1', 'spin', 1000, 1)""")
    expect_integrity_error(db, """INSERT INTO lingo_saaae_rate_limit_buckets
      (bucket_key, firebase_uid, route_key, window_start_epoch, request_count)
      VALUES ('bad-count', 'user-1', 'spin', 1000, -1)""")

    print('SAAAE_MIGRATION_SQLITE=PASS')
    print('ADDITIVE_RERUNNABLE_SCHEMA=PASS')
    print('TENANT_SCOPED_GRANTS=PASS')
    print('APPROVAL_SEPARATION_OF_DUTIES=PASS')
    print('APPROVAL_CONSUMPTION_STATE=PASS')
    print('APPEND_ONLY_AUTH_AUDIT=PASS')
    print('RATE_LIMIT_BUCKET_CONSTRAINTS=PASS')


if __name__ == '__main__':
    main()
