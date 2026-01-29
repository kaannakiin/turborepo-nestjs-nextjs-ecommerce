---
trigger: always_on
---

# Turbo Commands

## Development

```bash
bun run dev                    # Start all apps
bun run --filter=web dev       # Web only
bun run --filter=backend dev   # Backend only
```

---

## Build

```bash
bun run build                  # Build all packages (runs db:generate first)
bun run --filter=web build     # Web only
bun run --filter=backend build # Backend only
```

---

## Database

```bash
bun run db:generate            # Generate Prisma client
bun run db:migrate             # Create/apply migrations (dev)
bun run db:deploy              # Apply migrations (prod)
bun run db:prisma              # Open Prisma Studio
```

---

## Quality Checks

```bash
bun run check-types            # TypeScript type check
bun run lint                   # ESLint
```

> **IMPORTANT:** Always run `bun run check-types && bun run lint` after refactors!
