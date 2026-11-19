# Isolated website preview root

Cloudflare Pages uses this directory as its build root. `build.sh` invokes the repository's curated website staging script and writes only the allowlisted static website files to `dist/`. The preview project remains non-production and protected by Cloudflare Access.
