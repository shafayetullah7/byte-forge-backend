# Testing and Validation Guide

## Baseline Commands
- Typecheck: `npx tsc --noEmit --incremental false`
- Lint: `pnpm lint`
- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e`
- Coverage: `pnpm test:cov`

## What to Run by Change Type

### Controller/DTO-only changes
- Typecheck
- Lint
- Feature-level unit tests

### Service/repository logic changes
- Typecheck
- Lint
- Unit tests around use-case
- E2E tests for changed endpoint behavior (recommended)

### Schema-related changes
- Typecheck
- Lint
- Affected feature tests
- Manual smoke test for endpoints impacted by changed fields

### Order lifecycle/status transitions
- Validate allowed and blocked transitions
- Validate history rows are written
- Validate stale update behavior (`409`) where expected
- Validate cancellation constraints per actor

## API Regression Checklist
- Request body/query/path still validates as expected
- Response envelope and shape unchanged unless planned
- i18n keys exist for new user-facing messages
- Auth guards and ownership checks still applied

## Fast Sanity for Local Iteration
1. `npx tsc --noEmit --incremental false`
2. run only nearest tests
3. smoke invoke changed endpoint
