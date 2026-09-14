# Contributing to `@angelitosystems/nest-auth`

Thank you for your interest in contributing to the **Angelito Systems** NestJS Authentication Ecosystem!

We welcome contributions from the community. Please review the following guidelines before submitting issues or pull requests.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to professional, respectful, and collaborative communication. Harassment or discriminatory behavior will not be tolerated.

---

## Monorepo Workflow

This project is organized as an npm workspaces monorepo:

- `packages/core`: Core library (`@angelitosystems/nest-auth`)
- `packages/cli`: CLI toolkit (`nest-auth-kit`)
- `packages/prisma`: Prisma adapter (`@angelitosystems/nest-auth-prisma`)
- `packages/typeorm`: TypeORM adapter (`@angelitosystems/nest-auth-typeorm`)
- `packages/sequelize`: Sequelize adapter (`@angelitosystems/nest-auth-sequelize`)
- `packages/mongoose`: Mongoose adapter (`@angelitosystems/nest-auth-mongoose`)
- `docs-web`: Documentation website

### 1. Prerequisites

- Node.js >= 18.x (Recommended: Node 20 or 22)
- npm >= 9.x
- Docker (optional, for running local databases via `docker compose up -d`)

### 2. Setup

```bash
git clone https://github.com/AngelitoSystems/nest-auth.git
cd nest-auth
npm install --ignore-scripts
```

### 3. Verification Commands

Before opening a pull request, ensure all tests, typechecks, and builds pass:

```bash
# Typecheck all packages
npm run typecheck

# Run unit and integration tests
npm test

# Build all packages
npm run build
```

---

## Pull Request Guidelines

1. **Feature Branches**: Create a dedicated branch for your change:
   `git checkout -b feature/your-feature-name` or `fix/your-bugfix-name`
2. **Atomic Commits**: Write clear, descriptive commit messages following the Conventional Commits specification (e.g., `feat(core): add session revocation event`, `fix(cli): resolve schema path on windows`).
3. **Tests**: Add unit and integration tests for any new features or bug fixes.
4. **Documentation**: If your change modifies or introduces public APIs, update the corresponding documentation in `docs/` and `docs-web/`.

---

## Reporting Issues

Please open an issue on GitHub:
https://github.com/AngelitoSystems/nest-auth/issues

Include:
- Node.js & NestJS versions
- Database & ORM adapter in use
- Clear reproduction steps or code snippet
- Expected vs. actual behavior
