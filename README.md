# AegisGrid

> **AI-Driven Energy Supply Chain Resilience for Import-Dependent Economies**

**AegisGrid** is an AI-assisted energy supply-chain intelligence and decision-support platform for monitoring geopolitical and logistics disruptions, modelling their operational impact, evaluating mitigation scenarios, recommending executable responses, and recording auditable human decisions.

### Monitor disruption. Model consequences. Decide with confidence.

---

## Live Demo

**Production:** [https://aegis-grid-gilt.vercel.app](https://aegis-grid-gilt.vercel.app)

### Demo Credentials

| Field | Value |
| --- | --- |
| Email | `admin@aegis.gov` |
| Password | `admin` |

> These credentials are for the public demonstration environment only. Do not reuse them for a production system containing real operational data.

---

## Problem Statement

India imports approximately **88% of its crude oil**, with a significant proportion exposed to strategic maritime chokepoints such as the **Strait of Hormuz**.

Events including geopolitical escalation, sanctions, shipping attacks, corridor closures, and Red Sea disruption can rapidly affect:

- crude availability,
- logistics capacity,
- freight routes,
- refineries,
- strategic reserves,
- supply continuity,
- energy prices.

Traditional supply-chain planning tools are generally not designed to combine real-time geopolitical intelligence, network exposure, disruption modelling, rerouting recommendations, and human decision workflows in one operational system.

AegisGrid addresses this problem through an integrated energy-resilience workflow.

---

## Core Workflow

```text
Global Energy Network
        ↓
Threat / Event Detection
        ↓
Evidence Collection
        ↓
AI Analysis
        ↓
Risk Assessment
        ↓
Scenario Modelling
        ↓
Evaluation
        ↓
Impact & Constraints
        ↓
Response Candidates
        ↓
Scoring & Ranking
        ↓
Recommendation
        ↓
Human Decision
        ↓
Audit Trail
```

---

## Platform Capabilities

### Command Center

- Operational overview of network throughput, strategic reserve cover, disruption alerts, and aggregate risk.
- Corridor-volume distribution, critical arrivals, and network exposure summaries.
- Interactive geographic view of supply origins, routes, destinations, and risk checkpoints.

### Network Intelligence

- Explore suppliers, facilities, corridors, and supply flows in one workspace.
- Review capacity, throughput, operational status, dependencies, and risk scores.
- Inspect geographic network position and recommended or alternative routes.
- Simulate disruption against the selected network entity.

### Threat and Event Monitoring

- Track geopolitical, logistics, sanctions, weather, and infrastructure events.
- Review confirmed facts, affected assets, evidence, risk metrics, and operational implications.
- Present AI inference as a structured operational assessment rather than raw model output.

### Scenario Modelling and Evaluation

- Convert monitored events into bounded disruption scenarios.
- Define assumptions, constraints, affected nodes, duration, and severity.
- Evaluate supply, economic, operational, and resilience impact.
- Inspect simulation telemetry, affected flows, projected shortfall, and network state.

### Recommendations and Human Decisions

- Generate, score, rank, and compare mitigation candidates.
- Review feasibility, confidence, operational parameters, rationale, and trade-offs.
- Accept, reject, or modify a recommendation through a human decision workflow.
- Preserve traceability from event detection through final action.

### Audit Trail

- Record system-generated and human actions.
- Filter records by actor, action, entity type, and entity ID.
- Inspect decision rationale, state transitions, metadata, and target entities.

---

## Application Areas

| Workspace | Purpose |
| --- | --- |
| Command Center | Global operational overview and critical indicators |
| Network | Suppliers, facilities, corridors, flows, maps, and simulations |
| Events | Threat monitoring, evidence, AI analysis, and risk assessment |
| Scenarios | Disruption assumptions and scenario configuration |
| Evaluations | Impact calculation, constraints, and simulation results |
| Recommendations | Ranked mitigation responses and comparison |
| Decisions | Human approval, rejection, or modification workflow |
| Audit | Immutable operational traceability and record inspection |

---

## Architecture

AegisGrid is organized as an npm workspace monorepo with a clear separation between presentation, application, domain, infrastructure, and shared contracts.

```text
AegisGrid
├── client/     React + Vite operational interface
├── server/     Express API, domain services, engines, and persistence
├── shared/     Shared TypeScript contracts and enums
├── docs/       Product and engineering documentation
└── vercel.json Production deployment configuration
```

### Client

- Feature-oriented React application with protected routing.
- Axios API client with a deterministic demo adapter.
- Responsive operational workspaces, maps, charts, tables, and decision panels.
- Browser routing with deployment-safe SPA fallback.

### Server

- Express and TypeScript REST API under `/api/v1`.
- Domain entities, aggregates, rules, state machines, and application services.
- Simulation, impact, constraint, scoring, ranking, response, and recommendation engines.
- PostgreSQL repositories, migrations, authentication, authorization, and audit services.

### Shared

- API contracts, pagination types, enums, and reusable domain-facing definitions.

---

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Visualization | Recharts, D3 Geo, React Simple Maps, Lucide icons |
| Forms and validation | React Hook Form, Zod |
| API | Node.js, Express, Axios |
| Data | PostgreSQL, `pg` |
| Authentication | JWT, bcrypt |
| Testing | Vitest, Testing Library, Playwright, Node test runner |
| Deployment | Vercel |

---

## Run Locally

### Prerequisites

- Node.js `22.x`
- npm

### Demo Mode

Demo mode is the fastest way to run the complete interface. It uses deterministic local data and does not require PostgreSQL or external AI credentials.

```bash
git clone https://github.com/Shubham-creator941/AegisGrid.git
cd AegisGrid
npm install
npm run dev --workspace=client
```

Open [http://localhost:5173](http://localhost:5173) and sign in with:

```text
Email: admin@aegis.gov
Password: admin
```

Demo mode is enabled unless `VITE_USE_DEMO_DATA` is explicitly set to `false`.

### Full-Stack Mode

To connect the client to the Express API and PostgreSQL:

1. Create `server/.env` with the server and database configuration.
2. Create `client/.env` with the API URL and disable demo data.
3. Run migrations and seed the database.
4. Start the server and client workspaces.

Example client configuration:

```env
VITE_API_URL=http://localhost:3001
VITE_USE_DEMO_DATA=false
```

Example server configuration:

```env
PORT=3001
DATABASE_URL=postgres://user:password@localhost:5432/aegisgrid
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRES_IN=24h
AI_PROVIDER=mock
```

```bash
npm run migrate --workspace=server
npm run db:seed --workspace=server
```

Start the two development processes in separate terminals:

```bash
# Terminal 1
npm run dev --workspace=server

# Terminal 2
npm run dev --workspace=client
```

---

## Available Commands

Run commands from the repository root.

| Command | Description |
| --- | --- |
| `npm run dev` | Run available workspace development scripts; use separate workspace commands for full-stack development |
| `npm run build` | Build all workspaces |
| `npm run build:vercel` | Build shared contracts and the production client |
| `npm run typecheck` | Type-check all workspaces |
| `npm run test --workspace=client` | Run client unit and component tests |
| `npm run test --workspace=server` | Run server tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run migrate --workspace=server` | Apply database migrations |
| `npm run db:seed --workspace=server` | Seed development data |

---

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `VITE_USE_DEMO_DATA` | Client | Uses the built-in demo adapter unless set to `false` |
| `VITE_API_URL` | Client | Base URL of the AegisGrid API |
| `PORT` | Server | Express server port; defaults to `3001` |
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `JWT_SECRET` | Server | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | Server | Authentication-token lifetime |
| `AI_PROVIDER` | Server | AI provider identifier; defaults to `mock` |
| `AI_API_KEY` | Server | Provider key when a non-mock AI integration is used |

Never commit real credentials or production secrets. Configure them through the deployment platform or local untracked `.env` files.

---

## Deployment

The repository includes a production-ready `vercel.json` configuration that:

- installs dependencies with the npm lockfile,
- builds shared contracts before the client,
- publishes `client/dist`,
- supports direct React Router links through an SPA rewrite,
- applies long-lived caching to fingerprinted static assets.

Deploy from the repository root:

```bash
npx vercel --prod
```

The hosted demonstration intentionally uses the built-in demo data adapter. A production deployment backed by live data should deploy the API and PostgreSQL database separately, set `VITE_USE_DEMO_DATA=false`, and provide `VITE_API_URL`.

---

## API Surface

The Express application exposes versioned endpoints for:

- authentication,
- suppliers,
- facilities,
- corridors,
- supply flows,
- events and evidence,
- scenarios,
- evaluations,
- recommendations and decisions,
- audit records.

Health checks are available at `/health` when the server is running.

---

## Design Principles

- **Human authority:** AI recommendations support decisions; they do not replace accountable operators.
- **Traceability:** Every major transition can be associated with evidence, rationale, and an audit record.
- **Operational clarity:** Complex model output is translated into concise metrics, maps, risks, and actions.
- **Bounded simulation:** Scenarios remain explicit about assumptions, duration, affected assets, and constraints.
- **Deployment safety:** Demo and full-stack modes are deliberately separated to avoid accidental dependency on unavailable infrastructure.

---

## Disclaimer

AegisGrid is a decision-support demonstration. Its included data, analyses, risk scores, scenarios, and recommendations are illustrative and must not be treated as real-world energy trading, security, logistics, or public-policy advice.
