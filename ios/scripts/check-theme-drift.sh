#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
THEME_PATH="${IOS_ROOT}/Packages/DesignSystem/Sources/DesignSystem/Theme.swift"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

"${SCRIPT_DIR}/generate-theme.sh" "${TMP_DIR}/Theme.swift"
diff -u "${THEME_PATH}" "${TMP_DIR}/Theme.swift"

echo "Theme drift check passed."
