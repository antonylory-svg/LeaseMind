---
name: lm-policy-sync
description: Synchronize a human-approved LeaseMind decision into an explicitly declared controlled set of governance documents, with exact preflight, regression checks, and no staging or GitHub mutation. Invoke manually only.
argument-hint: "files=<exact list> expected-branch=<branch> expected-head=<sha> decisions=<record IDs>"
disable-model-invocation: true
---

# LeaseMind controlled policy sync

Synchronize `$ARGUMENTS`.

1. Require exact file allowlist, branch, HEAD/base, initial Git state, accepted decision-record IDs, required semantic changes, preserved invariants/counts, and forbidden changes. Stop if incomplete.
2. Verify preflight read-only. Stop on any unexpected tracked/untracked/staged file.
3. Read accepted records plus every affected source section. Decision records control only their approved boundaries; they do not authorize implementation or close broader questions automatically.
4. Modify only allowlisted files. Keep changes minimal and preserve metadata unless explicitly authorized.
5. Never edit the accepted decision records during sync.
6. Recalculate acceptance-criteria sequences, registries, decision counts, ownership labels, OPEN states, dependencies, and all three governance gates relevant to the controlled set.
7. Run whitespace and exact-file-set checks. Confirm staging remains empty.
8. Report which pass changed each file and finish with:
   `COMMIT CREATED: NO`
   `PUSH PERFORMED: NO`
   `PR MUTATION PERFORMED: NO`

Never run or request staging, commit, push, checkout/switch, or PR operations.
