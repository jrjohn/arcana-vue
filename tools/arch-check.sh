#!/usr/bin/env bash
# Run the same arch-qube scan CI runs (Jenkinsfile stage "Architecture Qube").
# Exit 0 = pass. Exit 1 = fail. Exit 2 = could not check (NOT a pass). See AGENTS.md §4.
#
#   tools/arch-check.sh
#   ARCH_QUBE_IMAGE=... tools/arch-check.sh      # override the image (e.g. a local build)
#
# The version comes from tools/arch-qube.version, which the Jenkinsfile reads too. Images are
# tried in order: ghcr.io/jrjohn/arch-qube:<ver> (public, multi-arch), then
# arcana.boo/arcana/arch-qube:<ver>. There is deliberately NO fallback to :latest — an
# unpinned scanner already turned another template's CI red overnight.
# Source is streamed in with tar | docker cp (a bind mount scans an empty tree under
# Docker-in-Docker), and the report is copied out to arch-qube-reports/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$ROOT/tools/arch-qube.version")"
THRESHOLD=90          # keep equal to the Jenkinsfile stage "Architecture Qube" (--threshold 90)
FRAMEWORK=vue         # keep equal to the Jenkinsfile (--framework vue)
NAME="arch-check-$$"

command -v docker >/dev/null || { echo "arch-check: docker not found — cannot check (this is NOT a pass)" >&2; exit 2; }
docker info >/dev/null 2>&1 || { echo "arch-check: docker daemon not reachable — cannot check (this is NOT a pass)" >&2; exit 2; }

IMAGE=""
for cand in ${ARCH_QUBE_IMAGE:-} "ghcr.io/jrjohn/arch-qube:${VERSION}" "arcana.boo/arcana/arch-qube:${VERSION}"; do
    if docker image inspect "$cand" >/dev/null 2>&1 || docker pull -q "$cand" >/dev/null 2>&1; then
        IMAGE="$cand"; break
    fi
done
[ -n "$IMAGE" ] || { echo "arch-check: arch-qube ${VERSION} image not pullable from ghcr.io or arcana.boo — cannot check (this is NOT a pass)" >&2; exit 2; }

cleanup() { docker rm -fv "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker create --name "$NAME" -v /src -v /output "$IMAGE" \
    scan /src --framework "$FRAMEWORK" --no-ai --ci \
    --format json,markdown -o /output --threshold "$THRESHOLD" >/dev/null \
    || { echo "arch-check: could not create the arch-qube container (image $IMAGE) — NOT a pass" >&2; exit 2; }

# macOS bsdtar carries extended attributes (com.apple.provenance) that docker cp refuses.
if tar --version 2>/dev/null | grep -q bsdtar; then
    TAR_NOXATTR=(--no-xattrs --no-mac-metadata)
    export COPYFILE_DISABLE=1
else
    TAR_NOXATTR=(--no-xattrs)
fi
# Same exclusions as the Jenkinsfile stage.
tar "${TAR_NOXATTR[@]}" --exclude=./.git --exclude=./node_modules --exclude=./dist \
    --exclude=./coverage --exclude=./arch-qube-reports \
    -C "$ROOT" -cf - . | docker cp - "$NAME":/src

set +e
docker start -a "$NAME"
RC=$?
set -e

mkdir -p "$ROOT/arch-qube-reports"
docker cp "$NAME":/output/. "$ROOT/arch-qube-reports/" >/dev/null 2>&1 || true

if [ "$RC" -eq 0 ]; then
    echo "arch-check: PASS ($IMAGE; report: arch-qube-reports/)"
else
    echo "arch-check: FAIL rc=$RC ($IMAGE) — --ci prints nothing on failure: read arch-qube-reports/arch-qube.md; fix the structure, do not lower the threshold (AGENTS.md §4)" >&2
fi
exit "$RC"
