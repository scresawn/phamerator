# Stage 1: Build the Meteor app
FROM node:20-bookworm AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ git curl bash ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Switch to the non-root node user for building
USER node
ENV HOME=/home/node
ENV PATH="/home/node/.meteor:$PATH"
ENV METEOR_HEADLESS=1
ENV CI=1

# Install Meteor directly in /home/node/.meteor
RUN curl -fsSL https://install.meteor.com/ | sh

WORKDIR /home/node/app
COPY --chown=node:node . .

# Install dependencies and build bundle
RUN npm install --no-audit --no-fund
RUN meteor build --directory /home/node/build --server-only

# Stage 2: Create the production image
FROM node:20-bookworm

WORKDIR /app

# Copy the built app "bundle" from the builder stage maintaining permissions
COPY --chown=node:node --from=builder /home/node/build/bundle ./

# Switch to the non-root "node" user
USER node

# Install server-specific dependencies for the built Meteor app securely
WORKDIR /app/programs/server
RUN npm install --omit=dev --no-audit --no-fund

WORKDIR /app

EXPOSE 9000

ENV PORT=9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 9000) + '/', (res) => process.exit(res.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "main.js"]
