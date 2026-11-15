/**
 * Thin adapter contract for the existing agent runtime to call the DMC.
 * It deliberately has no permissive fallback: absent transport or a malformed
 * response is a deny. This module is not connected to a live agent runtime.
 */
export function createDmcAgentGateway(callableTransport) {
  const call = async (name, payload) => {
    if (typeof callableTransport !== 'function') return { allowed:false, reason:'DMC_TRANSPORT_NOT_CONNECTED' };
    try {
      const response = await callableTransport(name,payload);
      const data = response?.data ?? response;
      if (!data || typeof data !== 'object') return { allowed:false, reason:'DMC_INVALID_RESPONSE' };
      return data;
    } catch {
      return { allowed:false, reason:'DMC_GATEWAY_UNAVAILABLE' };
    }
  };
  return Object.freeze({
    requestApproval: actionRequest => call('requestDmcApproval',{actionRequest}),
    authorizeToolCall: (actionRequest,approvalId=null) => call('authorizeDmcAgentAction',{actionRequest,approvalId}),
    createHandoff: handoff => call('createDmcHandoff',handoff),
    transitionHandoff: transition => call('transitionDmcHandoff',transition)
  });
}
