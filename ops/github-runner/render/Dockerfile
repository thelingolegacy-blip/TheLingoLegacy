FROM ubuntu:24.04
ARG RUNNER_VERSION=2.337.0
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git jq openssl util-linux \
    libicu74 libssl3t64 zlib1g libkrb5-3 libgcc-s1 libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash runner \
    && mkdir -p /opt/runner-dist \
    && curl -fsSL "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
       | tar -xz -C /opt/runner-dist \
    && cd /opt/runner-dist \
    && ./bin/installdependencies.sh \
    && chown -R root:root /opt/runner-dist \
    && chmod -R a-w /opt/runner-dist

COPY runner-cycle.sh /usr/local/bin/runner-cycle.sh
COPY runner-supervisor.sh /usr/local/bin/runner-supervisor.sh
RUN chmod 0755 /usr/local/bin/runner-cycle.sh /usr/local/bin/runner-supervisor.sh \
    && chown root:root /usr/local/bin/runner-cycle.sh /usr/local/bin/runner-supervisor.sh

ENTRYPOINT ["/usr/local/bin/runner-supervisor.sh"]
