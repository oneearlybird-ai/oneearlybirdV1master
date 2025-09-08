-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS citext;

-- Identity & tenancy
CREATE TABLE IF NOT EXISTS orgs (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email citext UNIQUE NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','member','viewer')),
  PRIMARY KEY (org_id, user_id)
);

-- Billing
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  metered boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  stripe_sub_id text UNIQUE NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_events (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  kind text NOT NULL,
  qty int NOT NULL,
  at timestamptz NOT NULL,
  trace_id text
);

-- Agents & memory
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  name text NOT NULL,
  mode text NOT NULL,
  instructions text,
  tools jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY,
  agent_id uuid NOT NULL,
  org_id uuid NOT NULL,
  channel text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY,
  conv_id uuid NOT NULL,
  role text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  tokens int
);

CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  kind text NOT NULL,
  embedding vector(1536),
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  provider text NOT NULL,
  access jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhooks_out (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  target_url text NOT NULL,
  kind text NOT NULL,
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security/ops
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  name text NOT NULL,
  hash bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  who uuid,
  action text NOT NULL,
  subject text,
  meta jsonb,
  at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  key text NOT NULL,
  window_name text NOT NULL,
  max int NOT NULL
);
