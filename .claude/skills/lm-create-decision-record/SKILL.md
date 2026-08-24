---
name: lm-create-decision-record
description: Create exactly one LeaseMind versioned governance decision record after explicit human confirmation, with fail-closed preflight and no policy sync or Git/PR mutation. Invoke manually only.
argument-hint: "target=<path> expected-branch=<branch> expected-head=<sha> decision=<approved wording or task file>"
disable-model-invocation: true
---

# LeaseMind single decision record

Create one record from `$ARGUMENTS`.

1. Require: exact target path, expected branch, expected HEAD and base/upstream, expected initial status, explicit human-approved wording, owners/authority, sources, open boundaries, gate impact, and change-control rule. Stop if any is absent.
2. Verify preflight read-only. Stop on mismatch. Never repair, switch, restore, reset, stash, or clean.
3. Read the current source documents, Inventory mapping, and relevant sibling records. Distinguish source authority, Proposal candidates, Inventory indexing, and precedent.
4. Create or edit only the exact target. It must remain the sole unstaged change unless the task explicitly declares a different initial controlled set.
5. Record only the approved narrow boundary. Preserve every stated OPEN item, fail-closed rule, non-authorization boundary, and BLOCKED gate. Do not invent runtime/API/DB/schema behavior, enums, thresholds, reason codes, or implementation claims.
6. Do not sync Policy, Inventory, manifests, indexes, or sibling records in this pass.
7. Verify whitespace, structure, required terms/counts, exact changed-file set, empty staging, and absence of forbidden overclaims.
8. Report findings and exact file list. End with:
   `COMMIT CREATED: NO`
   `PUSH PERFORMED: NO`
   `PR MUTATION PERFORMED: NO`

Never run or request `git add`, commit, push, branch changes, or PR actions.
