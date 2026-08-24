---
name: lm-readonly-audit
description: Perform a LeaseMind repository or governance artifact audit without changing files, Git state, external systems, or PRs. Invoke manually for preflight, adversarial review, corrective verification, or final readiness verdicts.
argument-hint: "<scope> expected-branch=<branch> expected-head=<sha>"
disable-model-invocation: true
context: fork
background: false
disallowed-tools: Edit Write NotebookEdit
---

# LeaseMind read-only audit

Audit `$ARGUMENTS` without mutations.

1. Require an explicit scope, expected branch, expected HEAD/base, and expected working-tree/staging state. Stop if any is missing.
2. Verify branch, HEAD, base/upstream, working tree, staging, and exact file set using read-only Git commands. Do not fetch.
3. Stop on any preflight mismatch; report it without repairing state.
4. Read each relevant source completely enough to verify authority, normative status, counts, dependencies, OPEN decisions, and gates independently.
5. Review adversarially. Report findings first, ordered `BLOCKER/HIGH/MEDIUM/LOW`, with exact file/line evidence and a minimal corrective boundary. Do not edit.
6. If there are no findings, return `READY FOR STAGING`, `READY FOR HUMAN DECISION`, or the narrower verdict justified by the task. Never claim implementation approval unless a source explicitly grants it.
7. Confirm final Git state and finish with:
   `FILES CHANGED: NONE`
   `COMMIT CREATED: NO`
   `PUSH PERFORMED: NO`
   `PR MUTATION PERFORMED: NO`

Never ask to stage, commit, push, or mutate a PR.
