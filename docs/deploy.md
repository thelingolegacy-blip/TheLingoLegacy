# Deployment notes

That’s My Lingo is a static HTML site and deploys on Vercel without a build command.

## Vercel settings

- Framework preset: Other
- Build command: leave empty
- Output directory: leave empty / repository root
- Install command: leave empty

## Important routes

- `/` — production homepage
- `/landing/` — campaign landing page
- `/app/` — playable daily game shell
- `/assets/` — brand asset library
- `/universe/` — connected universe route map for production, command center, assets, game rooms, and brand-world pages

After merging changes to the production branch, Vercel will create a new production deployment automatically if the project is connected to this repository.
