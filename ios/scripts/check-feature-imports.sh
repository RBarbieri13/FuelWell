#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FEATURES_DIR="${IOS_ROOT}/Features"
PACKAGES_DIR="${IOS_ROOT}/Packages"

if [[ ! -d "${FEATURES_DIR}" ]]; then
  echo "No Features directory found at ${FEATURES_DIR}"
  exit 1
fi

is_declared_feature() {
  local name="$1"
  [[ -d "${FEATURES_DIR}/${name}" ]]
}

is_declared_package() {
  local name="$1"
  [[ -d "${PACKAGES_DIR}/${name}" ]]
}

nearest_module_name() {
  local file="$1"
  local base_dir="$2"
  local relative

  relative="${file#"${base_dir}"/}"
  printf '%s\n' "${relative%%/*}"
}

extract_imports() {
  local file="$1"

  awk '
    {
      line = $0
      sub(/\/\/.*/, "", line)

      if (line ~ /^[[:space:]]*(@[A-Za-z_][A-Za-z0-9_]*(\([^)]*\))?[[:space:]]+)*(@testable[[:space:]]+)?import[[:space:]]+[A-Za-z_][A-Za-z0-9_]*/) {
        gsub(/^[[:space:]]*/, "", line)
        sub(/^(@[A-Za-z_][A-Za-z0-9_]*(\([^)]*\))?[[:space:]]+)*/, "", line)
        sub(/^@testable[[:space:]]+/, "", line)
        sub(/^import[[:space:]]+/, "", line)
        split(line, parts, /[^A-Za-z0-9_]/)
        print parts[1]
      }
    }
  ' "${file}"
}

violations=0

while IFS= read -r -d '' file; do
  feature_name="$(nearest_module_name "${file}" "${FEATURES_DIR}")"

  while IFS= read -r imported_module; do
    [[ -z "${imported_module}" ]] && continue

    if is_declared_feature "${imported_module}"; then
      echo "${file}: feature '${feature_name}' illegally imports feature '${imported_module}'"
      violations=$((violations + 1))
    elif is_declared_package "${imported_module}"; then
      :
    fi
  done < <(extract_imports "${file}")
done < <(find "${FEATURES_DIR}" -type f -name '*.swift' ! -path '*/Tests/*' -print0)

if [[ -d "${PACKAGES_DIR}" ]]; then
  while IFS= read -r -d '' file; do
    package_name="$(nearest_module_name "${file}" "${PACKAGES_DIR}")"

    while IFS= read -r imported_module; do
      [[ -z "${imported_module}" ]] && continue

      if is_declared_feature "${imported_module}"; then
        echo "${file}: package '${package_name}' illegally imports feature '${imported_module}'"
        violations=$((violations + 1))
      fi
    done < <(extract_imports "${file}")
  done < <(find "${PACKAGES_DIR}" -type f -name '*.swift' ! -path '*/Tests/*' -print0)
fi

if [[ "${violations}" -gt 0 ]]; then
  echo "Import direction check failed with ${violations} violation(s)."
  exit 1
fi

echo "Import direction check passed."
