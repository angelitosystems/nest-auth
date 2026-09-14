# Development Guide

This guide covers local setup, test execution, database container management, and publishing for `@angelitosystems/nest-auth`.

---

## 1. Local Environment Setup

Clone the repository and install dependencies across all workspaces:

```bash
git clone https://github.com/AngelitoSystems/nest-auth.git
cd nest-auth
npm install --ignore-scripts
```

### Starting Development Databases

A `docker-compose.yml` file is provided to start local instances of PostgreSQL, MySQL, and MongoDB:

```bash
# Start test databases in the background
docker compose up -d

# Check running status
docker compose ps

# Stop databases when done
docker compose down
```

---

## 2. Compiling Packages

Compile all workspaces simultaneously:

```bash
npm run build
```

Or build a specific package:

```bash
npm run build --workspace=@angelitosystems/nest-auth
npm run build --workspace=nest-auth-kit
npm run build --workspace=@angelitosystems/nest-auth-prisma
```

---

## 3. Running Automated Tests

Run test suites across all packages:

```bash
npm test
```

Run test suite with code coverage:

```bash
npm run test:coverage
```

---

## 4. Testing the CLI Locally

You can test the CLI binary without publishing using Node:

```bash
# Help output
node packages/cli/bin/nest-auth-kit.js --help

# Environment Doctor
node packages/cli/bin/nest-auth-kit.js doctor

# Test interactive init in a sandbox directory
mkdir test-sandbox && cd test-sandbox
node ../packages/cli/bin/nest-auth-kit.js init
```

---

## 5. Documentation Portal (`docs-web`)

The documentation web portal is located in `docs-web/`:

```bash
# Start local development server
npm run dev --workspace=docs-web

# Build static documentation
npm run build --workspace=docs-web
```
