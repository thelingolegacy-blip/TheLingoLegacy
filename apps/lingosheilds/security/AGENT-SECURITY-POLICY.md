# LINGOsheilds Agent Security Policy

1. Every agent run receives a unique identity.
2. Every work order is scoped to repository, ref, paths, tools and expiration.
3. Production credentials are prohibited in agent context.
4. Network access is deny-by-default and explicitly granted per task.
5. Tool calls are logged with operation IDs.
6. Model output is treated as untrusted data.
7. Generated code must pass validation before integration.
8. Security findings may block a work order.
9. Agents cannot approve their own changes.
10. Agents cannot promote production.
11. Agent sessions expire automatically.
12. Emergency disablement must revoke credentials and cancel queued work.
