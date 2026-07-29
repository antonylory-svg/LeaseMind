#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must point to a disposable PostgreSQL 15+ database}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# The Node runner owns the full lifecycle and its finally block executes the
# exact down migration even when a behavior/security probe fails.
node tests/run_postgres_suite.mjs
