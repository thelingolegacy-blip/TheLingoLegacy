const ROLE_CAPABILITIES = Object.freeze({
  owner: [
    "vsm.read", "release.create", "release.probe", "release.attest", "release.accept.local",
    "sonic_boom.configure", "bot.invoke", "evidence.read", "audit.verify", "forge.admin",
    "studio.propose", "math.validate", "identity.manage"
  ],
  engineer: ["vsm.read", "release.create", "release.probe", "studio.propose", "math.validate"],
  studio_lead: ["vsm.read", "studio.propose"],
  operator: ["vsm.read", "release.probe", "audit.verify"],
  auditor: ["vsm.read", "evidence.read", "audit.verify"]
});
const ALWAYS_DENIED = new Set(["production.promote", "production.dns.write", "production.secret.rotate", "data.delete", "authority.hold.remove"]);
export function authorize(principal, capability) {
  if (!principal || principal.status !== "active" || typeof principal.id !== "string" || !Array.isArray(principal.roles)) return false;
  if (ALWAYS_DENIED.has(capability)) return false;
  return principal.roles.some(role => ROLE_CAPABILITIES[role]?.includes(capability));
}
export function policySnapshot() {
  return {
    mode: "default-deny",
    roles: Object.fromEntries(Object.entries(ROLE_CAPABILITIES).map(([role, capabilities]) => [role, [...capabilities]])),
    always_denied: [...ALWAYS_DENIED],
    production_bridge: "DISABLED"
  };
}
