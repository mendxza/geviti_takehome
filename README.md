# Geviti Takehome

Full-stack Fastify + Next.js application with a simple housing price prediction workflow backed by Prisma + PostgreSQL.

## Requirements

- **Node.js** `20.11.1` (automatically picked up via `.nvmrc`)
- **npm** (ships with Node.js)
- **Go** `1.22` or newer (for the helper CLI, optional but recommended)
- **Docker Desktop** (or Docker Engine) with Docker Compose support
- **PostgreSQL** – provided via the included Docker Compose file

## Quick start

```bash
# clone the repo
nvm use                 # ensures Node 20.11.1

go run . db:up          # start local Postgres (docker compose)
go run . install        # npm install in server/ and ui/
go run . migrate        # apply Prisma migrations
go run . dev            # run Fastify API (port 3001) + Next UI (port 3100)
```

- API available at `http://127.0.0.1:3001`
- UI available at `http://localhost:3100` (Next.js dev server proxies `/api/*` to the API)
- Stop everything with `Ctrl+C`. The helper will forward the signal to both child processes.

To tear down the database container:

```bash
go run . db:down
```

## Environment variables

Create `server/.env` before running migrations:

```env
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"
```

The provided Docker Compose file exposes the same credentials.

## Go helper commands

The repository root contains a tiny Go CLI (`main.go`) to streamline common tasks:

| Command | Description |
| --- | --- |
| `go run . install` | Run `npm install` in `server/` and `ui/`. |
| `go run . db:up` | Start the local Postgres container (`docker compose up -d`). |
| `go run . db:down` | Stop the local Postgres container. |
| `go run . migrate` | Run Prisma migrations (`npm run prisma:migrate`). |
| `go run . dev` | Start Fastify (port 3001) and Next dev (port 3100) concurrently. |

## Manual alternative

You can run each step manually if you prefer not to use Go:

```bash
# start database
docker compose -f server/docker-compose.yml up -d

# install dependencies
cd server && npm install
cd ../ui && npm install

# apply migrations
cd ../server && npm run prisma:migrate

# run dev servers (in separate terminals)
npm run dev        # inside server/
npm run dev        # inside ui/
```

UI defaults to port 3100. It rewrites `/api/*` to the Fastify server running on `http://127.0.0.1:3001`.

