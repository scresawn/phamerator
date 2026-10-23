# Stage 1: Build the Meteor app
FROM node:24-bookworm AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ git curl bash ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Switch to the non-root node user for building
USER node
ENV HOME=/home/node
ENV PATH="/home/node/.meteor:$PATH"
ENV METEOR_HEADLESS=1
ENV CI=1
ENV TOOL_NODE_FLAGS="--max-old-space-size=4096"

# Install Meteor directly in /home/node/.meteor and pre-warm the exact Meteor 3.5.3 release
RUN curl -fsSL https://install.meteor.com/ | sh && \
    meteor --release 3.5.3 --version

WORKDIR /home/node/app

# 1. Install npm dependencies first (cached across application code edits)
COPY --chown=node:node package*.json ./
RUN npm install --no-audit --no-fund

# 2. Copy the rest of the application source code
COPY --chown=node:node . .

# 3. Build the production bundle
RUN meteor build --directory /home/node/build --server-only

# Stage 2: Create the production image
FROM node:24-bookworm

WORKDIR /app

# Switch to the non-root "node" user
USER node

# Copy the built app bundle from builder stage
COPY --chown=node:node --from=builder /home/node/build/bundle ./

# Install server-specific dependencies (executes npm-rebuild.js)
WORKDIR /app/programs/server
RUN npm install --omit=dev --no-audit --no-fund

WORKDIR /app

EXPOSE 9000

ENV PORT=9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 9000) + '/').then(r => process.exit(r.status < 500 ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "main.js"]
