# LG webOS TV package target

This is a packaging scaffold for a TV-optimized web experience, not a signed or store-submitted application.

## Build prerequisites
- LG webOS TV SDK / CLI installed locally.
- Developer mode and a registered TV device for on-device testing.
- Approved app identity, icons, privacy disclosures, remote-navigation QA, and store submission account.

## Package
Copy the verified static portal build into this directory as `index.html` and its required assets, then run:

```sh
ares-package --no-minify --outdir dist/webos platforms/webos
```

Install to a registered TV with the SDK's device profile and `ares-install`. Do not submit until TV remote, focus, playback, network-loss, privacy, and performance tests pass. No LG credentials or signing material are stored in this repository.
