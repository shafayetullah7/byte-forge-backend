# ADR-0001: Order Lifecycle Integrity and Migration Ownership

## Status
Accepted

## Context
Order and shipment lifecycle changes touch multiple layers:
- transition constraints
- inventory/payment side effects
- timeline/history correctness
- frontend contract assumptions

At the same time, DB migration execution is handled by developer/user workflow, not by automated coding changes.

## Decision
1. Lifecycle transitions are centralized in transition service(s).
2. Status mutations must:
   - run in transaction when side effects are coupled
   - write history/audit entries
   - enforce optimistic concurrency checks where expected
3. Schema changes are made in drizzle schema source files.
4. Migration generation/execution remains a user-owned operation.

## Consequences
- Better consistency across buyer/seller/admin surfaces.
- Lower risk of invalid state jumps.
- Clear separation between code changes and environment migration operations.
