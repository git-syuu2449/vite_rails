#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
sudo rm -f /tmp/pids/server.pid

# 権限をホスト（実際は実行ユーザー）に合わせる
sudo chown -R appuser:appgroup /app
sudo chown -R appuser:appgroup /usr/local/bundle/

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"