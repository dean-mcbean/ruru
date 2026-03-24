# Ruru

Ruru is an integration hub: an **Express** backend that receives webhooks, talks to **Slack**, **GitHub**, **Basecamp**, **Runn**, **HubSpot**, and **Motion**, and persists state in **MongoDB**. It ships with a **Vue 3** dashboard (Vuetify) for authenticated users to view and sync work across those tools.

---

## Capabilities

### Dashboard (Vue SPA)

- **Login:** Sign-in email must match the domain (or suffix) configured in `ALLOWED_EMAIL_DOMAIN` in `.env` / `constants.js`. The server resolves the address to a Slack user, sends a one-time code in Slack DM, and on success issues JWT access and refresh tokens (stored client-side; refresh tokens are hashed in MongoDB).
- **Project management:** Side-by-side lists for **Basecamp**, **Runn**, and **HubSpot** deals with search, sorting, and actions such as duplicating a Runn project into Basecamp (with template choice), a HubSpot deal into Runn (client picker), or notifying Slack after operations.
- **Upload Markdown to Basecamp:** Upload a `.md` file and target bucket ID to create a Basecamp document.
- **Placeholder pages:** Feature flags and user management views exist as stubs (“Coming soon”).
- **API client:** Axios instance with `Bearer` auth, optional `UI-client-name` header, and automatic access-token refresh when the API responds with `TokenExpired`.

The SPA is built to `dashboard/` with `publicPath: /dashboard/` and is served by Express from `dashboard/dist`, or redirected to a local dev URL when `IS_DEVELOPMENT=true`.

### Webhooks and inbound HTTP

| Route                         | Purpose                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /`                      | **GitHub** multiplexer: pull requests, issues, `workflow_run`, pushes from `github-actions[bot]`, branch `create`, and optional **Playwright**-style payloads via query params. |
| `POST /curl/`                 | Internal-style JSON for `update_version` (stage/version updates).                                                                                                               |
| `POST /slack/`                | Slack **message actions** (log bug, feedback, data error, engine suggestion) and **block actions** (dynamic handlers registered in code).                                       |
| `POST /slack/copytaskstorunn` | Slack slash command: copy Basecamp todo lists into **Runn** phases (`/copytaskstorunn [basecamp_project_id] [runn_project_id]`).                                                |
| `POST /pipeline/`             | Stores per-client pipeline status in MongoDB (`persistent_item`).                                                                                                               |
| `POST /hubspot/`              | HubSpot property webhooks; when `dealstage` matches `HUBSPOT_DEALSTAGE_RUNN_TRIGGER_ID`, a **Runn** project may be created.                                                      |
| `POST /api/`                  | Legacy no-op; returns `200` for backward compatibility.                                                                                                                         |

### Authenticated dashboard API (`/dash-api/*`)

Mounted under `/dash-api` (see `routes/dashboard/index.js`):

- **Auth:** `signup`, `verify`, `refresh`, `logout`
- **Runn:** list clients, list/create projects
- **Basecamp:** list projects, create project, create todolist, upload markdown (multer)
- **HubSpot:** list deals
- **Slack:** post notifications from the dashboard

Protected routes require `Authorization: Bearer <access_token>` (`JWT_SECRET`).

### Slack and GitHub behaviour (high level)

- **Pull requests / reviews:** Events can update Slack threads, repo-specific channels (from MongoDB mappings), and user DMs based on stored notification preferences.
- **CI / deploy workflows:** Named workflows (`DeployToDev`, `DeployToTest`, `DeployToApps`) update MongoDB workflow and per-repo “stage” metadata (versions, PR lists, last run).
- **Message shortcuts:** Selected Slack messages can be logged into **Basecamp**/tracking flows (with Basecamp token refresh via 37signals OAuth refresh token).
- **Motion:** Used when logging bugs/tasks (API key on outbound requests).

---

## Tech stack

| Layer            | Choices                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime**      | Node.js                                                                                                                                |
| **HTTP API**     | Express 4, `cors`, `cookie-parser`, `morgan`, EJS error views                                                                          |
| **Auth**         | `jsonwebtoken`, `bcrypt` (refresh token hashing)                                                                                       |
| **Data**         | `mongodb` driver; multiple DB names in use (`ruru-2` for users, `ruru` for `persistent_item`, `ruru-cache` for cached Slack/API reads) |
| **Integrations** | `@slack/web-api`, `axios` / `node-fetch`, GitHub REST with `GITHUB_TOKEN`                                                              |
| **Dashboard**    | Vue 3, Vue Router, Pinia, Vuetify 3, Font Awesome / MDI                                                                                |
| **Tooling**      | ESLint, Vue CLI 5, Babel; `nodemon` + `concurrently` for dev                                                                           |

---

## Repository layout

| Path                | Role                                                                |
| ------------------- | ------------------------------------------------------------------- |
| `app.js`, `bin/www` | Express app, static `/dashboard`, CORS, routes                       |
| `constants.js`      | Server-side defaults and structured non-secret config (see below)   |
| `routes/`           | Inbound HTTP: `index.js` (webhooks), `dashboard/` (JSON API)        |
| `dispatch/`         | Outbound side effects (Slack messages, Runn/Basecamp/Motion writes) |
| `fetch/`            | Outbound reads (Slack, GitHub, Basecamp, Runn, HubSpot)             |
| `utils/`            | Slack block builders, GitHub message formatting, Mongo helpers      |
| `middleware/`       | `requireDashboardAuth`, Basecamp token refresh                      |
| `storage/`          | MongoDB-backed `Users` collection interface                         |
| `dashboard/`        | Vue SPA source; production assets in `dashboard/dist`               |

---

## Configuration

**Secrets and deployment-specific values** live in a `.env` file (loaded in `bin/www` via `dotenv`). Use `temp.env` in the repo as a checklist of variable names.

**Defaults and integration shape** (API base URLs, HubSpot pipeline stage tables, Slack/GitHub repo lists, allowed email domain fallbacks, etc.) are centralized in **`constants.js`**. Override behaviour with environment variables where each key is read.

Typical groups:

- **Core:** `PORT`, `JWT_SECRET`, `MONGO_CONNECTION_STRING`, `IS_DEVELOPMENT`, `CORS_ORIGIN`, `DASHBOARD_DEV_ORIGIN`, `ALLOWED_EMAIL_DOMAIN`
- **Slack:** `BOT_TOKEN`, `SLACK_USER_TOKEN`, `ADMIN_SLACK_USER_ID`, `SLACK_WORKSPACE_SUBDOMAIN`, usergroups, channel IDs, `SLACK_HOME_TRACKED_REPOS`, `DEVELOPER_GITHUB_REPOS`, `ANALYST_GITHUB_REPOS`, `WORKFLOW_REQUEST_REPO`
- **GitHub:** `GITHUB_TOKEN`, `GITHUB_ORG`, `PLAYWRIGHT_ARTIFACT_REPO`
- **Basecamp:** OAuth client/refresh tokens, `BASECAMP_ACCOUNT_ID`, `BASECAMP_USER_AGENT`, bucket/card-list IDs for Slack shortcuts
- **Runn / HubSpot / Motion:** API tokens and optional defaults (`RUNN_*`, `HUBSPOT_*`, `MOTION_*`, `RURU_PUBLIC_BASE_URL`)

**Dashboard build:** set `VUE_APP_*` when running `npm run build` in `dashboard/` (e.g. `VUE_APP_BASE_API_URL` must point at the `/dash-api` URL the browser can reach). Optional UI defaults are documented in `temp.env`.

Replace the **HubSpot stage id lists** inside `constants.js` with your portal’s pipeline definitions when you use the deals dashboard or webhooks.

---

## Running locally

1. **Install dependencies**

   ```bash
   npm install
   cd dashboard && npm install && cd ..
   ```

2. **MongoDB**  
   Ensure a server is reachable at `MONGO_CONNECTION_STRING` (defaults to `mongodb://localhost:27017` in some code paths).

3. **Environment**  
   Copy `temp.env` to `.env` and fill in values. Adjust `constants.js` if you rely on in-repo defaults for HubSpot stages or other structured config.

4. **Dashboard bundle**

   ```bash
   cd dashboard && npm run build && cd ..
   ```

5. **Start the API**

   ```bash
   npm start
   ```

   Defaults to **port 3000**. Open the app at `http://localhost:3000` (root redirects to `/dashboard`).

**Development with auto-reload:** On macOS/Linux, `npm run dev` runs `dev.sh`, which uses `concurrently` to run `nodemon` on `bin/www` and `npm run dashboard:dev` in `dashboard/` (Vue CLI `build --watch`). Rebuild output is consumed from `dashboard/dist` when `IS_DEVELOPMENT` is not set to redirect away.

On **Windows**, run the same processes in separate terminals if `dev.sh` is not available, or use Git Bash/WSL for the shell script.

---

## Production notes

- Serve the built dashboard from `dashboard/dist`; set `IS_DEVELOPMENT` to anything other than `'true'` so Express serves static files instead of redirecting.
- Set `CORS_ORIGIN` (and related env) to match your deployed dashboard origin.
- Webhook URLs exposed by this app must match how GitHub, Slack, and HubSpot are configured in those products’ admin UIs.
