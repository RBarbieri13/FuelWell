#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
port="${PORT:-8787}"

PORT="${port}" node "${script_dir}/server.js"
