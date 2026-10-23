#!/usr/bin/env bash
# Safe marker only. No runner installation, registration, or repository execution.
set -eu
install -d -m 0750 /var/lib/lingo-g02
cat > /var/lib/lingo-g02/bootstrap-status.txt <<'EOF'
status=host-initialized-runner-not-installed
next_step=review-host-then-install-runner-using-official-GitHub-instructions
EOF
chmod 0640 /var/lib/lingo-g02/bootstrap-status.txt
