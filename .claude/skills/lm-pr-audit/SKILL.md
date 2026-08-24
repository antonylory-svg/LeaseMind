---
name: lm-pr-audit
description: Audit a LeaseMind GitHub pull request read-only by verifying base/head refs, immutable head SHA, changed-file scope, draft state, mergeability, and checks. Invoke manually before ready or merge decisions.
argument-hint: "pr=<number> repo=antonylory-svg/LeaseMind expected-head=<sha> expected-base=<branch>"
disable-model-invocation: true
context: fork
background: false
disallowed-tools: Edit Write NotebookEdit
---

# LeaseMind read-only PR audit

Audit `$ARGUMENTS` without mutations.

1. Require PR number, repository, expected immutable head SHA, expected head branch, expected base branch, and expected file scope.
2. Use only read-only `gh pr view`, `gh pr diff`, `gh pr checks`, and read-only Git commands.
3. Verify head SHA before interpreting checks. Treat `UNKNOWN`, pending checks, conflicts, unexpected files, or changed SHA as not ready.
4. Report exact state: draft, open/merged, mergeability, check totals, additions/deletions, and changed files.
5. Return only a recommendation: `READY TO MARK FOR REVIEW`, `READY TO MERGE`, or `NOT READY`, with reasons.
6. Never execute or suggest a compound mutation command. End with `PR MUTATION PERFORMED: NO`.

Never call `gh pr create/edit/ready/merge/close/reopen/comment/review`, `gh workflow run`, mutating `gh run`, or `gh api`.
