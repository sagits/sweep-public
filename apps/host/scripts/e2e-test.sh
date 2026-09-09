#!/usr/bin/env bash
# Detox drives a debug dev client, which loads its JS bundle from Metro. Start Metro, wait for
# it, run the suites, then shut it down — so `pnpm e2e:test` works from a cold shell.
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p .expo
npx expo start --port 8081 >.expo/metro-e2e.log 2>&1 &
metro_pid=$!
trap 'kill "$metro_pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 90); do
  if curl -sf http://localhost:8081/status >/dev/null; then
    break
  fi
  sleep 1
done

if ! curl -sf http://localhost:8081/status >/dev/null; then
  echo "Metro did not come up on :8081 — see apps/host/.expo/metro-e2e.log" >&2
  exit 1
fi

npx detox test --configuration ios.sim.debug "$@"
