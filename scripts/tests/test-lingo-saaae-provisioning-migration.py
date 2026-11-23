import pathlib
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parents[2]
SQL = (ROOT / 'migrations/0003_lingo_saaae_provisioning_evidence.sql').read_text()


def expect_integrity_error(db, sql, params=(), expected=None):
    try:
        db.execute(sql, params)
    except sqlite3.IntegrityError as error:
        if expected:
            assert expected in str(error), str(error)
    else:
        raise AssertionError(f'expected integrity failure: {sql}')


def insert_request(db, request_id='req-1', **overrides):
    values = {
        'request_id': request_id, 'environment': 'staging',
        'target_firebase_project': 'lingo-legacy-staging',
        'target_firebase_uid': 'target-uid', 'tenant_id': 'tenant-staging',
        'product_id': 'thats-my-lingo', 'resource_id': 'game:thats-my-lingo',
        'operation': 'spin', 'effect': 'allow',
        'valid_from': '2026-11-23T00:00:00.000Z',
        'expires_at': '2026-11-24T00:00:00.000Z',
        'reason': 'Approved staging access for QA validation',
        'ticket_reference': 'https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/658',
        'request_digest': 'a' * 64, 'requester_operator_id': 'operator-requester',
    }
    values.update(overrides)
    cols = ', '.join(values)
    placeholders = ', '.join('?' for _ in values)
    db.execute(f'INSERT INTO lingo_saaae_provisioning_requests ({cols}) VALUES ({placeholders})', tuple(values.values()))


def main():
    db = sqlite3.connect(':memory:')
    db.execute('PRAGMA foreign_keys = ON')
    db.executescript(SQL)
    db.executescript(SQL)  # safe repeatability
    assert db.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name LIKE 'lingo_saaae_provisioning_%'").fetchone()[0] == 2

    # Initial state cannot be forged as approved/executed/terminal.
    expect_integrity_error(db, "INSERT INTO lingo_saaae_provisioning_requests (request_id, environment, target_firebase_project, target_firebase_uid, tenant_id, product_id, resource_id, operation, effect, valid_from, expires_at, reason, ticket_reference, request_digest, requester_operator_id, status) VALUES ('preapproved','staging','stage','uid','tenant','product','resource','read','allow','2026-11-23','2026-11-24','A valid reason here','ticket',?, 'requester','approved')", ('d' * 64,), 'INITIAL_STATE_MUST_BE_PENDING')

    insert_request(db)
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET request_digest=? WHERE request_id='req-1'", ('b' * 64,), 'BINDING_IMMUTABLE')
    expect_integrity_error(db, "DELETE FROM lingo_saaae_provisioning_requests WHERE request_id='req-1'", (), 'REQUEST_RETAINED')

    # Requester cannot approve their own request.
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET status='approved', reviewer_operator_id='operator-requester', reviewed_at='2026-11-23T00:01:00.000Z' WHERE request_id='req-1'", (), 'CHECK constraint')
    db.execute("UPDATE lingo_saaae_provisioning_requests SET status='approved', reviewer_operator_id='operator-reviewer', reviewed_at='2026-11-23T00:01:00.000Z' WHERE request_id='req-1'")
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET status='pending', reviewer_operator_id=NULL, reviewed_at=NULL WHERE request_id='req-1'", (), 'INVALID_STATE_TRANSITION')

    # Executor must differ from both requester and reviewer.
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET status='executed', executor_operator_id='operator-requester', executed_at='2026-11-23T00:02:00.000Z' WHERE request_id='req-1'", (), 'CHECK constraint')
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET status='executed', executor_operator_id='operator-reviewer', executed_at='2026-11-23T00:02:00.000Z' WHERE request_id='req-1'", (), 'CHECK constraint')
    db.execute("UPDATE lingo_saaae_provisioning_requests SET status='executed', executor_operator_id='operator-executor', executed_at='2026-11-23T00:02:00.000Z' WHERE request_id='req-1'")
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET status='expired' WHERE request_id='req-1'", (), 'INVALID_STATE_TRANSITION')

    # A reviewed request that expires must retain its reviewer evidence.
    insert_request(db, request_id='req-2')
    db.execute("UPDATE lingo_saaae_provisioning_requests SET status='approved', reviewer_operator_id='reviewer-2', reviewed_at='2026-11-23T00:01:00.000Z' WHERE request_id='req-2'")
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET status='expired', reviewer_operator_id=NULL, reviewed_at=NULL WHERE request_id='req-2'", (), 'TERMINAL_STATE_METADATA_INVALID')
    db.execute("UPDATE lingo_saaae_provisioning_requests SET status='expired' WHERE request_id='req-2'")

    # Environment, reason, digest, and event request linkage are constrained.
    expect_integrity_error(db, "INSERT INTO lingo_saaae_provisioning_requests (request_id, environment, target_firebase_project, target_firebase_uid, tenant_id, product_id, resource_id, operation, effect, valid_from, expires_at, reason, ticket_reference, request_digest, requester_operator_id) VALUES ('bad-env','production','prod','uid','tenant','product','resource','read','allow','2026-11-23','2026-11-24','A valid reason here','ticket',?, 'requester')", ('c' * 64,), 'CHECK constraint')
    expect_integrity_error(db, "INSERT INTO lingo_saaae_provisioning_requests (request_id, environment, target_firebase_project, target_firebase_uid, tenant_id, product_id, resource_id, operation, effect, valid_from, expires_at, reason, ticket_reference, request_digest, requester_operator_id) VALUES ('bad-digest','staging','stage','uid','tenant','product','resource','read','allow','2026-11-23','2026-11-24','A valid reason here','ticket','short','requester')", (), 'CHECK constraint')
    expect_integrity_error(db, "INSERT INTO lingo_saaae_provisioning_audit (event_id, request_id, correlation_id, actor_operator_id, event_type, reason_code, request_digest) VALUES ('orphan','missing-request','corr','operator','request_submitted','SUBMITTED',?)", ('a' * 64,), 'FOREIGN KEY')
    expect_integrity_error(db, "INSERT INTO lingo_saaae_provisioning_audit (event_id, request_id, correlation_id, actor_operator_id, event_type, reason_code, request_digest) VALUES ('bad-digest','req-1','corr','operator','request_submitted','SUBMITTED',?)", ('b' * 64,), 'DIGEST_MISMATCH')

    db.execute("INSERT INTO lingo_saaae_provisioning_audit (event_id, request_id, correlation_id, actor_operator_id, event_type, reason_code, request_digest) VALUES ('event-1','req-1','corr-1','operator-requester','request_submitted','SUBMITTED',?)", ('a' * 64,))
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_audit SET reason_code='tampered' WHERE event_id='event-1'", (), 'AUDIT_APPEND_ONLY')
    expect_integrity_error(db, "DELETE FROM lingo_saaae_provisioning_audit WHERE event_id='event-1'", (), 'AUDIT_APPEND_ONLY')
    expect_integrity_error(db, "UPDATE lingo_saaae_provisioning_requests SET status='approved' WHERE request_id='req-1'", (), 'INVALID_STATE_TRANSITION')

    print('SAAAE_PROVISIONING_MIGRATION_SQLITE=PASS')
    print('ADDITIVE_RERUNNABLE_EVIDENCE_SCHEMA=PASS')
    print('STAGING_ONLY_SCOPE=PASS')
    print('REQUEST_BINDING_IMMUTABLE=PASS')
    print('REQUESTER_REVIEWER_EXECUTOR_SEPARATION=PASS')
    print('REQUEST_STATE_MACHINE=PASS')
    print('INITIAL_PENDING_ONLY=PASS')
    print('TERMINAL_STATE_METADATA=PASS')
    print('AUDIT_DIGEST_BINDING=PASS')
    print('REQUEST_AND_AUDIT_RETENTION=PASS')
    print('APPEND_ONLY_PROVISIONING_AUDIT=PASS')
    print('AUDIT_REQUEST_FOREIGN_KEY=PASS')


if __name__ == '__main__':
    main()
