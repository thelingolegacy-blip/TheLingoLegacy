# LINGOsheilds Studio Reference Topology

```
                         USERS / TEAMS
                              │
                       LINGO IDENTITY
                              │
                       CLOUDFLARE EDGE
                              │
                 ┌────────────┴────────────┐
                 │                         │
           CONTROL API                WEB CONSOLE
                 │
        ┌────────┼─────────┐
        │        │         │
   Repository  Policy    Agent
    Registry   Engine   Gateway
        │        │         │
        └────────┼─────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
  LINGO GIT            PROVIDER BRIDGE
       │              ┌─────┴─────┐
       │           GitHub       GitLab
       │
  ┌────┴──────────────────────────┐
  │         RUNNER GRID           │
  │ Linux │ ARM │ Windows │ Mac  │
  └──────────────┬────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
   AGENT FABRIC        BUILD/TEST
        │                  │
      Claude            Artifacts
        │                  │
        └────────┬─────────┘
                 │
          SECURITY PLANE
                 │
          EVIDENCE PLANE
                 │
          RELEASE PLANE
                 │
          ENVIRONMENT GRID
                 │
          LIVE SYSTEMS
                 │
          POST-LIVE VERIFY
```
