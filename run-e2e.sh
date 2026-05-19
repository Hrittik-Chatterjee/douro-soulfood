#!/bin/bash
set -e

# Kill any existing process on port 8788
EXISTING_PID=$(ss -tlnp 2>/dev/null | grep ':8788' | grep -oP 'pid=\K\d+' | head -1)
if [ -n "$EXISTING_PID" ]; then
  echo "Killing existing server on port 8788 (PID $EXISTING_PID)"
  kill "$EXISTING_PID" 2>/dev/null || true
  sleep 1
fi

# Start static server in background
node /tmp/serve-dist.mjs &
SERVER_PID=$!
echo "Server started with PID $SERVER_PID"

# Wait for server to be ready
for i in $(seq 1 10); do
  if curl -s -o /dev/null http://127.0.0.1:8788/ 2>/dev/null; then
    echo "Server is ready!"
    break
  fi
  sleep 1
done

# Run Playwright tests
cd /home/z/my-project/douro-soulfood
npx playwright test --reporter=line --timeout=15000 "$@"
TEST_EXIT=$?

# Cleanup
kill $SERVER_PID 2>/dev/null || true
exit $TEST_EXIT
