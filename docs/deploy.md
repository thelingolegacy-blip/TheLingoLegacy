# Deployment notes

The Lingo Legacy is a static HTML site and deploys on Vercel without a build command.

## Vercel settings

- Framework preset: Other
- Build command: leave empty
- Output directory: leave empty / repository root
- Install command: leave empty

## Important routes

- `/` — production homepage
- `/landing/` — campaign landing page
- `/app/` — app preview shell
- `/assets/` — brand asset library

After merging changes to the production branch, Vercel will create a new production deployment automatically if the project is connected to this repository.
