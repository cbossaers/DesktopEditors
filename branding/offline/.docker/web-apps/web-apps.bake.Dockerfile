# ==============================================================================
# MODULE DOCKERFILE
# This file is not meant to be built standalone. It is consumed by the 
# docker-bake.hcl files in the parent monorepos.
# ==============================================================================

ARG PRODUCT_VERSION
ARG BUILD_ROOT

#### BASE ####
FROM ubuntu:24.04 AS web-base
    RUN apt-get update && \
        apt-get install -y ca-certificates curl gnupg openjdk-21-jdk wget zip brotli bzip2 && \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y nodejs && \
        npm install -g @yao-pkg/pkg grunt-cli && \
        rm -rf /var/lib/apt/lists/*

#### WEB-APPS ####
FROM web-base AS web-apps
    ARG PRODUCT_VERSION
    ARG BUILD_ROOT=/package

    COPY web-apps/build/package*.json /app/build/
    COPY web-apps/build/sprites/package*.json /app/build/sprites/
    COPY web-apps/build/plugins/grunt-inline/ /app/build/plugins/grunt-inline/

    RUN --mount=type=cache,target=/root/.npm \
        cd app/build && \
        npm install


    COPY web-apps/ /app

    # NOTE: Add a conditional overlay copy here if web-apps source changes are
    # ever needed for offline hardening. For now all relevant web-app URLs are
    # already disabled (canAnalytics=false by default), so the overlay is not
    # required and is omitted to avoid failing when branding/offline/web-apps
    # does not exist.

    ENV PRODUCT_VERSION=${PRODUCT_VERSION}
    ENV BUILD_ROOT=${BUILD_ROOT}

    RUN cd app/translation && \
        python3 merge_and_check.py

    ARG TARGETARCH
    RUN cd app/build && \
        THEME=euro-office grunt $(if [ "$TARGETARCH" = "arm64" ]; then echo "--skip-imagemin"; fi)