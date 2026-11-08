FROM ubuntu:24.04
ARG RUNNER_VERSION=2.337.0
ARG RUNNER_SHA256=70920811a4f8ad4328818682bca5c6469c1c942fab52448868071d0063816613
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git jq libicu74 libssl3t64 zlib1g libkrb5-3 libgcc-s1 libstdc++6 && rm -rf /var/lib/apt/lists/*
RUN useradd --create-home --shell /bin/bash runner && mkdir -p /opt/actions-runner && chown -R runner:runner /opt/actions-runner
WORKDIR /opt/actions-runner
RUN set -eux; \
    archive="actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"; \
    curl --fail --show-error --silent --location --retry 3 \
      --output "${archive}" \
      "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${archive}"; \
    echo "${RUNNER_SHA256}  ${archive}" | sha256sum --check --strict -; \
    tar xzf "${archive}"; \
    rm -f "${archive}"; \
    ./bin/installdependencies.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod 0755 /entrypoint.sh && chown runner:runner /entrypoint.sh
USER runner
ENTRYPOINT ["/entrypoint.sh"]
