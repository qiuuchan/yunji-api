#!/usr/bin/env bash
# Print repo-root-relative paths changed between two revisions.
#
# Shared by the quality gate workflow: the diff-aware frontend lint job and the
# migration safety gate both need the exact same notion of "what changed".
#
# Contract (all inputs are environment variables):
#   BASE_SHA  required — base revision (push: github.event.before, PR: base.sha)
#   HEAD_SHA  optional — head revision, defaults to the checked out HEAD
#
# Exit codes:
#   0 — changed paths printed to stdout (possibly empty)
#   2 — inputs missing or a revision cannot be resolved (fail closed, never
#       silently pretend that nothing changed)

set -euo pipefail

BASE_SHA="${BASE_SHA:-}"
HEAD_SHA="${HEAD_SHA:-HEAD}"

if [ -z "$BASE_SHA" ]; then
  echo "changed-files: BASE_SHA is required" >&2
  exit 2
fi

# A push that creates a new branch reports an all-zero base revision. Diff
# against the empty tree so that every file counts as added.
BASE_IS_EMPTY_TREE=0
if [[ "$BASE_SHA" =~ ^0+$ ]]; then
  BASE_SHA="$(git hash-object -t tree /dev/null)"
  BASE_IS_EMPTY_TREE=1
fi

for rev in "$BASE_SHA" "$HEAD_SHA"; do
  if [ "$rev" = "HEAD" ]; then
    continue
  fi
  if [ "$BASE_IS_EMPTY_TREE" = "1" ] && [ "$rev" = "$BASE_SHA" ]; then
    continue
  fi
  if ! git cat-file -e "$rev^{commit}" 2>/dev/null; then
    echo "changed-files: fetching missing revision $rev" >&2
    git fetch --no-tags --no-recurse-submodules --depth=1 origin "$rev" >&2 || true
  fi
  if ! git cat-file -e "$rev^{commit}" 2>/dev/null; then
    echo "changed-files: unable to resolve revision $rev" >&2
    exit 2
  fi
done

# ACMRT: added, copied, modified, renamed, type-changed. Deleted files are
# excluded — nothing to lint or review in a file that no longer exists.
git diff --name-only --diff-filter=ACMRT "$BASE_SHA" "$HEAD_SHA"
