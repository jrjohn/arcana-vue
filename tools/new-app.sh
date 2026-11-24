#!/usr/bin/env bash
# Start a new Vue product from this repo's full layered skeleton.
#
#   tools/new-app.sh billing-portal ~/Documents/projects/billing-portal
#
# Copies the committed tree (git archive HEAD), so the new product keeps AGENTS.md,
# CLAUDE.md, tools/ (scaffolding + hook + arch-check), the Jenkinsfile and the arch-qube
# gate. `npm create vue` plus a few copied src/ folders loses all of that (AGENTS.md §1).
#
# No --no-demo option: the template has no demo-only module. The User feature is the worked
# example tools/new-feature.sh copies, the IndexedDB offline store and sync queue are typed
# to it, and HomePage, the layout panels and the integration test use it. Remove it later
# through the DI container and router, not by deleting folders.
set -euo pipefail

[ $# -eq 2 ] || { echo "usage: $0 <app-name> <dest-dir>" >&2; exit 1; }
APP="$1"
DEST="$2"
[[ "$APP" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]] || { echo "app-name: lower-case letters/digits, words joined by '-' (it becomes the npm package, image and CI names)" >&2; exit 1; }
case "$APP" in arcana|arcana-vue|vue-app) echo "app-name must differ from the template's own names" >&2; exit 1 ;; esac
[ ! -e "$DEST" ] || { echo "$DEST already exists — refusing to overwrite" >&2; exit 1; }
command -v perl >/dev/null || { echo "perl is required" >&2; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
git -C "$ROOT" diff --quiet HEAD -- AGENTS.md tools/ src/ || echo "note: uncommitted changes are NOT copied (git archive HEAD)" >&2

mkdir -p "$DEST"
git -C "$ROOT" archive HEAD | tar -x -C "$DEST"
SRC_SHA="$(git -C "$ROOT" rev-parse --short HEAD)"
TITLE="$(printf '%s' "$APP" | perl -pe 's/(^|-)([a-z])/($1?" ":"").uc($2)/ge')"   # billing-portal -> Billing Portal
DBNAME="$(printf '%s' "$TITLE" | tr -d ' ')DB"                                      # BillingPortalDB
cd "$DEST"

# ---- Product identity. Every place the template name is load-bearing:
#  1. npm package "arcana-vue" (package.json, package-lock.json); the metrics name in the Jenkinsfile.
#  2. Jenkins APP_NAME / image "vue-app" (also docker-compose.ci.yml), unit-test container
#     vue-app-test-*, Sonar key vue-app / name "Vue App".
#  3. arch-qube CI container arcana-arch-qube-vue-* — two products on one Jenkins host must
#     not share (or `docker rm -f`) each other's containers.
#  4. Browser identity: <title>/document.title "Arcana Vue", and the IndexedDB name "ArcanaDB" —
#     two products served from the same origin (e.g. localhost:5173) would otherwise read
#     each other's offline cache and sync queue.
# Not renamed on purpose: the "Arcana" brand text / welcome strings (UI copy the product
# rewrites anyway), the registry host arcana.boo and the localhost:5000/arcana/ namespace
# (shared infrastructure), README prose. tools/ is excluded: these scripts describe the template.
TEXT_FILES="$(grep -rIl -e arcana-vue -e vue-app -e "Vue App" -e "Arcana Vue" -e ArcanaDB -e arcana-arch-qube-vue . \
    --exclude-dir=.git --exclude-dir=tools --exclude=CHANGELOG.md --exclude=README.md || true)"
[ -n "$TEXT_FILES" ] || { echo "new-app: no template identities found — the template changed; update tools/new-app.sh" >&2; exit 1; }
printf '%s\n' "$TEXT_FILES" | APP="$APP" TITLE="$TITLE" DBNAME="$DBNAME" xargs perl -pi -e '
    s/arcana-arch-qube-vue-/$ENV{APP}-arch-qube-/g;
    s/\barcana-vue\b/$ENV{APP}/g;
    s/\bvue-app\b/$ENV{APP}/g;
    s/Vue App/$ENV{TITLE}/g;
    s/Arcana Vue/$ENV{TITLE}/g;
    s/\x27ArcanaDB\x27/\x27$ENV{DBNAME}\x27/g;
'
LEFT="$(grep -rInE --exclude-dir=.git --exclude-dir=tools --exclude=CHANGELOG.md --exclude=README.md 'arcana-vue|\bvue-app\b|Vue App|Arcana Vue|ArcanaDB|arcana-arch-qube-vue' . || true)"
if [ -n "$LEFT" ]; then
    echo "new-app: template identities still present after rename:" >&2
    printf '%s\n' "$LEFT" | head >&2
    exit 1
fi

# ---- Fresh history: version 0.1.0, empty changelog.
rm -f CHANGELOG.md
printf '{\n  ".": "0.1.0"\n}\n' > .release-please-manifest.json
perl -0pi -e "s/(\"name\": \"${APP}\",\n\\s*\"version\": \")[^\"]+\"/\${1}0.1.0\"/g" package.json package-lock.json
perl -pi -e 's/^# Arcana Vue$/# '"$TITLE"'/' README.md

cat >> AGENTS.md <<EOT

## Origin

Created from arcana-vue @ \`${SRC_SHA}\` by \`tools/new-app.sh\` (package, image, CI, Sonar,
page title and IndexedDB names renamed to \`${APP}\`). The layers, rules and definition of
done above apply unchanged. Remove template features you do not need through
\`src/core/di/container.ts\` and \`src/router/index.ts\`, not by flattening.
EOT

git init -q
tools/install-hooks.sh >/dev/null
git add -A
# --no-verify only for this import commit: every file counts as "added" here, so the hook
# would judge the template's own root files (src/main.ts, src/App.vue, src/vite-env.d.ts) as
# new flat files. The template itself passes arch-check; every later commit goes through the hook.
git -c user.name="${GIT_AUTHOR_NAME:-new-app}" -c user.email="${GIT_AUTHOR_EMAIL:-new-app@localhost}" \
    commit -q --no-verify -m "chore: start ${APP} from arcana-vue ${SRC_SHA}"

echo "created $DEST (${APP}) from arcana-vue ${SRC_SHA}; hooks: $(git config core.hooksPath)"
echo "next: cd $DEST && npm ci && tools/new-feature.sh <Name>"
