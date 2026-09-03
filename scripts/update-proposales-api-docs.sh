#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
readonly API_DOCUMENTATION_ROOT="${REPO_ROOT}/api-documentation"
readonly DESTINATION="${API_DOCUMENTATION_ROOT}/proposales"
readonly LLMS_URL="https://docs.proposales.com/llms.txt"
readonly OPENAPI_URL="https://docs.proposales.com/openapi.json"

mkdir -p "${API_DOCUMENTATION_ROOT}"

stage_parent="$(mktemp -d "${API_DOCUMENTATION_ROOT}/.proposales-api-docs.XXXXXX")"
stage="${stage_parent}/proposales"
backup_parent=""
old_destination_moved=0
snapshot_installed=0

cleanup() {
    status=$?

    if [[ "${snapshot_installed}" -eq 0 && "${old_destination_moved}" -eq 1 && ! -e "${DESTINATION}" && -e "${backup_parent}/proposales" ]]; then
        mv -- "${backup_parent}/proposales" "${DESTINATION}" || true
    fi

    rm -rf -- "${stage_parent}"
    if [[ -n "${backup_parent}" ]]; then
        rm -rf -- "${backup_parent}"
    fi

    exit "${status}"
}
trap cleanup EXIT

mkdir -p "${stage}"

curl -gfsSL --retry 3 --retry-delay 1 "${LLMS_URL}" -o "${stage}/llms.txt"
curl -gfsSL --retry 3 --retry-delay 1 "${OPENAPI_URL}" -o "${stage}/openapi.json"

urls_file="${stage_parent}/markdown-urls.txt"
awk '
    match($0, /https:\/\/docs\.proposales\.com\/[^)]*\.md/) {
        print substr($0, RSTART, RLENGTH)
    }
' "${stage}/llms.txt" | sort -u > "${urls_file}"

markdown_count=0
while IFS= read -r url; do
    [[ -n "${url}" ]] || continue

    relative_path="${url#https://docs.proposales.com/}"
    case "${relative_path}" in
        ""|/*|../*|*/../*|*"/.."*)
            printf 'Unsafe documentation path from URL: %s\n' "${url}" >&2
            exit 1
            ;;
    esac

    local_path="${stage}/${relative_path}"
    mkdir -p -- "$(dirname -- "${local_path}")"
    curl -gfsSL --retry 3 --retry-delay 1 "${url}" -o "${local_path}"
    markdown_count=$((markdown_count + 1))
done < "${urls_file}"

if [[ "${markdown_count}" -eq 0 ]]; then
    printf 'No Markdown documentation URLs found in %s\n' "${LLMS_URL}" >&2
    exit 1
fi

if [[ -f "${DESTINATION}/README.md" ]]; then
    cp -- "${DESTINATION}/README.md" "${stage}/README.md"
fi

if [[ -e "${DESTINATION}" ]]; then
    backup_parent="$(mktemp -d "${API_DOCUMENTATION_ROOT}/.proposales-api-docs-backup.XXXXXX")"
    mv -- "${DESTINATION}" "${backup_parent}/proposales"
    old_destination_moved=1
fi

mv -- "${stage}" "${DESTINATION}"
snapshot_installed=1

printf 'Downloaded %d Markdown pages, llms.txt, and openapi.json to %s\n' \
    "${markdown_count}" "${DESTINATION}"
