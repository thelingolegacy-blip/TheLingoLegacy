const ALLOWED_ROLES = new Set(['requester', 'reviewer', 'executor']);
const ALLOWED_FIELDS = new Set(['subject', 'type', 'status', 'roles', 'person_ref', 'independence_attestation_id', 'attestation_issuer']);
const MAX_SUBJECT_LENGTH = 256;
const MAX_REGISTRY_ENTRIES = 32;

/**
 * Parse a server-owned operator roster. Identity is keyed only by the
 * cryptographically verified immutable subject; email and display names are
 * deliberately not accepted as identity keys.
 */
export function parseSaaaeOperatorRegistry(raw) {
  if (typeof raw !== 'string' || raw.length < 2 || raw.length > 32_768) {
    return { ok: false, code: 'OPERATOR_REGISTRY_UNAVAILABLE' };
  }

  let entries;
  try {
    entries = JSON.parse(raw);
  } catch {
    return { ok: false, code: 'OPERATOR_REGISTRY_INVALID' };
  }
  if (!Array.isArray(entries) || entries.length > MAX_REGISTRY_ENTRIES) {
    return { ok: false, code: 'OPERATOR_REGISTRY_INVALID' };
  }

  const subjects = new Set();
  const humanPersonRefs = new Set();
  const operators = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)
        || Object.keys(entry).some((key) => !ALLOWED_FIELDS.has(key))) {
      return { ok: false, code: 'OPERATOR_REGISTRY_INVALID' };
    }
    const { subject, type, status, roles, person_ref: personRef,
      independence_attestation_id: attestationId, attestation_issuer: attestationIssuer } = entry;
    if (typeof subject !== 'string' || subject.length < 1
        || subject.length > MAX_SUBJECT_LENGTH || subject.trim() !== subject
        || subjects.has(subject)) {
      return { ok: false, code: 'OPERATOR_REGISTRY_INVALID' };
    }
    if (!['human', 'workload'].includes(type)
        || !['active', 'disabled'].includes(status)
        || !Array.isArray(roles) || roles.length < 1
        || new Set(roles).size !== roles.length
        || roles.some((role) => !ALLOWED_ROLES.has(role))) {
      return { ok: false, code: 'OPERATOR_REGISTRY_INVALID' };
    }
    if ((type === 'human' && roles.includes('executor'))
        || (type === 'workload' && roles.some((role) => role !== 'executor'))) {
      return { ok: false, code: 'OPERATOR_REGISTRY_INVALID' };
    }
    if (type === 'human') {
      // person_ref is a pseudonymous identifier issued by the independently
      // verified workforce identity process, not a caller-selected account ID.
      if (typeof personRef !== 'string' || personRef.length < 8 || personRef.length > 256
          || personRef.trim() !== personRef || humanPersonRefs.has(personRef)
          || typeof attestationId !== 'string' || attestationId.length < 8 || attestationId.length > 256
          || attestationId.trim() !== attestationId
          || typeof attestationIssuer !== 'string' || attestationIssuer.length < 3 || attestationIssuer.length > 256
          || attestationIssuer.trim() !== attestationIssuer) {
        return { ok: false, code: 'OPERATOR_INDEPENDENCE_ATTESTATION_REQUIRED' };
      }
      humanPersonRefs.add(personRef);
    } else if (personRef !== undefined || attestationId !== undefined || attestationIssuer !== undefined) {
      return { ok: false, code: 'OPERATOR_REGISTRY_INVALID' };
    }
    subjects.add(subject);
    operators.push({
      subject, type, status, roles: [...roles],
      ...(type === 'human' ? {
        personRef, independenceAttestationId: attestationId, attestationIssuer,
      } : {}),
    });
  }

  return { ok: true, operators };
}

/** Require two separately keyed human operators and a separate workload executor. */
export function saaaeOperatorRegistryReadiness(registry) {
  if (!registry?.ok || !Array.isArray(registry.operators)) {
    return { ready: false, code: 'OPERATOR_REGISTRY_UNAVAILABLE' };
  }
  const active = registry.operators.filter((operator) => operator.status === 'active');
  const humans = active.filter((operator) => operator.type === 'human');
  const requester = humans.find((operator) => operator.roles.includes('requester'));
  const reviewer = humans.find((operator) => operator.roles.includes('reviewer')
    && operator.subject !== requester?.subject);
  const executor = active.find((operator) => operator.type === 'workload'
    && operator.roles.includes('executor'));
  if (humans.length < 2 || !requester || !reviewer || !executor
      || executor.subject === requester.subject || executor.subject === reviewer.subject
      || requester.personRef === reviewer.personRef
      || !requester.independenceAttestationId || !reviewer.independenceAttestationId) {
    return { ready: false, code: 'INDEPENDENT_OPERATOR_ROSTER_REQUIRED' };
  }
  return { ready: true, code: 'OPERATOR_REGISTRY_READY' };
}

/** Resolve and enforce distinct requester, reviewer, and executor identities. */
export function authorizeSaaaeProvisioningActors(registry, {
  requesterSubject, reviewerSubject, executorSubject,
} = {}) {
  const readiness = saaaeOperatorRegistryReadiness(registry);
  if (!readiness.ready) return { ok: false, code: readiness.code };

  const bySubject = new Map(registry.operators.map((operator) => [operator.subject, operator]));
  const requester = bySubject.get(requesterSubject);
  const reviewer = bySubject.get(reviewerSubject);
  const executor = bySubject.get(executorSubject);
  if (!requester || requester.status !== 'active' || requester.type !== 'human'
      || !requester.roles.includes('requester')) {
    return { ok: false, code: 'REQUESTER_NOT_AUTHORIZED' };
  }
  if (!reviewer || reviewer.status !== 'active' || reviewer.type !== 'human'
      || !reviewer.roles.includes('reviewer')) {
    return { ok: false, code: 'REVIEWER_NOT_AUTHORIZED' };
  }
  if (!executor || executor.status !== 'active' || executor.type !== 'workload'
      || !executor.roles.includes('executor')) {
    return { ok: false, code: 'EXECUTOR_NOT_AUTHORIZED' };
  }
  if (new Set([requester.subject, reviewer.subject, executor.subject]).size !== 3) {
    return { ok: false, code: 'SAAAE_ACTOR_SEPARATION_REQUIRED' };
  }
  return {
    ok: true,
    actors: {
      requester: requester.subject,
      reviewer: reviewer.subject,
      executor: executor.subject,
    },
  };
}
