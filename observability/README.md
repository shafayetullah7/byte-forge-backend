# Observability stack (Phase 1)

Prometheus + Grafana + postgres_exporter for **byte-forge-auth**. Services use the Docker Compose **`observability` profile** — they only start when that profile is enabled.

## Commands

| Script | What runs |
|--------|-----------|
| `pnpm run docker:dev` | App + Postgres only (light) |
| `pnpm run docker:dev:obs` | App + Postgres + Prometheus + Grafana + postgres_exporter |
| `pnpm run docker:prod` | Production app + Postgres only |
| `pnpm run docker:prod:obs` | Production app + Postgres + observability (recommended on home server) |
| `pnpm run docker:down` | Stop dev stack (includes observability if it was running) |
| `pnpm run docker:prod:down` | Stop prod stack (includes observability if it was running) |

Equivalent raw Compose:

```bash
# Dev with observability
docker compose -f docker-compose.yml -f docker-compose.observability.yml \
  --profile observability --env-file .env.development up

# Prod with observability
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  -f docker-compose.observability.yml --profile observability \
  --env-file .env.production up -d --build
```

`docker:test` intentionally does **not** include observability.

## Quick start (observability learning)

```bash
# From byte-forge-auth/
pnpm run docker:dev:obs
```

| Service    | URL (defaults)              |
|------------|-----------------------------|
| API        | http://localhost:3005       |
| Metrics    | http://localhost:3005/metrics |
| Prometheus | http://localhost:9090       |
| Grafana    | http://localhost:3001       |

Grafana login: `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` from `.env.development` (defaults: `admin` / `admin`).

Provisioned dashboard: **ByteForge → ByteForge API — RED**.

## Verify scrape targets

1. Open Prometheus → **Status → Targets**.
2. All jobs should be **UP**: `prometheus`, `byte-forge-auth`, `postgres`.

If `byte-forge-auth` is **DOWN**, check that `observability/prometheus/prometheus.yml` scrape target port matches `PORT` in your env file (default `app:3005`).

## Learning drills (Phase 1)

```bash
# Rate — health check loop
while true; do curl -s -o /dev/null http://localhost:3005/health; done

# Errors — 404s
for i in $(seq 1 50); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3005/api/v1/does-not-exist; done

# Metrics endpoint
curl -s http://localhost:3005/metrics | head
```

Watch panels update in Grafana (10s refresh).

## Stop

```bash
pnpm run docker:down          # development
pnpm run docker:prod:down     # production
```

## Files

```
docker-compose.observability.yml   # profile: observability
observability/
  prometheus/prometheus.yml
  grafana/provisioning/
    datasources/prometheus.yml
    dashboards/dashboards.yml
    dashboards/json/red-api.json
```

## Security note

`/metrics`, Prometheus (9090), and Grafana (3001) are exposed for local/home-lab learning. On a public home server: use strong Grafana credentials, firewall these ports, and restrict `/metrics` to internal scrape networks.
