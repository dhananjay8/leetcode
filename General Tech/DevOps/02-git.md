# Git & Version Control — Interview Notes

## 1. Core Model

```text
Working Directory ──git add──▶ Staging (index) ──git commit──▶ Local repo ──git push──▶ Remote
        ▲ git checkout/restore ──▲ git restore --staged ──▲ git reset
```

`git fetch` updates remote-tracking refs only; `git pull` = `fetch` + `merge` (or `+ rebase` with `pull.rebase=true`).

---

## 2. Essential Commands

```bash
# setup & daily
git config --global user.name "Name"; git config --global user.email "e@x.com"
git init | git clone <url>
git status | git add . | git commit -m "feat: x" | git push origin main | git pull

# branching (modern: switch/restore)
git branch | git switch -c feat | git switch feat
git branch -d feat | git branch -D feat        # safe vs force delete
git merge feat | git rebase main

# undoing
git stash | git stash pop
git restore file            # discard unstaged edits
git restore --staged file   # unstage
git reset HEAD~1            # undo commit, keep changes (mixed)
git reset --hard HEAD~1     # undo commit, DISCARD changes
git revert <hash>           # new commit that undoes — safe on shared history
git cherry-pick <hash>      # apply one commit elsewhere
git log --oneline --graph | git diff [--staged] | git blame file
git rebase -i HEAD~3        # squash commits: change pick→squash
```

### Recovery & Forensics (the "oh no" commands)

```bash
git reflog                            # HEAD history — recovers "lost" commits/dangling work
git switch -c rescue <sha>            # resurrect from reflog
git bisect start && bisect bad && bisect good v1.2   # binary-search the breaking commit
git stash push -m "wip" | stash list | stash apply stash@{1}
git worktree add ../hotfix hotfix     # second checkout, no stash dance
git clean -fdx                        # nuke untracked+ignored (dry-run: -n first!)
git log -S "password" --all           # pickaxe: find commit that added a string
git blame -L 10,20 file               # who wrote these lines
git cherry -v main feat               # commits in feat not yet in main
```

---

## 3. Merge vs Rebase vs Revert (favorite comparisons)

| | Merge | Rebase |
| --- | ------- | -------- |
| History | Preserves, adds merge commit | Rewrites, linear |
| Shared branches | Safe | **Never rebase shared history** |
| Conflict cost | Once at merge | Once **per replayed commit** |
| Use | Integrate into main | Clean feature branch before merging |

| | Revert | Reset |
| --- | -------- | ------- |
| Effect | New commit undoing a change | Moves HEAD, drops commits |
| Shared-safe | ✅ | ❌ (rewrites history) |

### PR Merge Strategies (Merge Commit vs Squash vs Rebase)

| Strategy | Graph shape | Pros | Cons |
| --- | --- | --- | --- |
| **Create a merge commit** (`--no-ff`) | Preserves feature branch + merge node | Full history of branch context; easy to revert entire PR | Noisy "railroad tracks" graph in busy repos |
| **Squash and merge** | Collapses all PR commits into **1 commit** on `main` | Clean 1-commit-per-PR linear history; trivial `git revert` and `git bisect` | Loses granular intermediate commits on `main` |
| **Rebase and merge** | Replays each PR commit linearly onto `main` | Linear history + preserves individual commits | Every intermediate commit must pass tests or `git bisect` breaks |

### Scale & Safety Features (`--force-with-lease`, Monorepo Git)

- **`git push --force-with-lease` vs `--force`**: `--force` blindly overwrites the remote branch; `--force-with-lease` checks that the remote ref matches your last-fetched ref (fails safely if a teammate pushed in the meantime).
- **CI & Monorepo speedups**: `git clone --depth 1` (shallow clone — cuts 3-minute CI checkouts to 5 seconds), `git clone --filter=blob:none` (blobless clone), and `git sparse-checkout` (materialize only needed directories in a monorepo).
- **`.git` Object Model (under the hood)**: content-addressable store in `.git/objects/` keyed by SHA-1/SHA-256 of 4 types: **blob** (file bytes), **tree** (directory listing pointing to blobs/subtrees), **commit** (points to root tree + parent commit SHAs + author), and **annotated tag**. Branches are just 41-byte files in `.git/refs/heads/` holding a commit SHA; `HEAD` is a pointer to the current branch ref.

---

## 4. Workflows

| Workflow | Shape | Fit |
| ---------- | ------- | ----- |
| **Trunk-based** | main always deployable; feature branches < 1 day; flags hide WIP | Most modern teams / CD |
| **GitFlow** | main ← develop ← feature/release/hotfix branches | Scheduled releases, older orgs |
| **Fork-and-PR** | Contributors fork, PR to upstream | OSS |

---

## 5. Interview Q&A

**Q: Resolve a merge conflict?**
`<<<<<<<`/`=======`/`>>>>>>>` markers → edit to the right result → `git add` → `git commit` (merge) or `git rebase --continue` (rebase).

**Q: `pull` vs `fetch`?**
fetch downloads without touching your work; pull = fetch + merge.

**Q: Detached HEAD?**
HEAD on a commit, not a branch — commits there are orphaned once you switch away unless you `git switch -c rescue` first.

**Q: Commit to wrong branch?**
`git switch -c right-branch` (commit travels with HEAD) or `git cherry-pick` it then `reset --hard` the wrong branch.

**Q: Secret committed — what now?**
Rotate the credential immediately → purge history (`git filter-repo`/BFG) → force-push (coordinate!) → prevent with pre-commit scanning + push protection.

**Q: Rebase vs merge in practice?**
Rebase feature branches onto main before PR (linear, bisectable); merge PRs into main (preserves context, no shared-history rewrites).

**Q: `reset --hard` ate a commit — recover?**
`git reflog` → find the SHA → `git switch -c rescue <sha>`. Git keeps dangling commits ~90 days (gc.pruneExpire).

**Q: Find which commit broke it with no obvious suspect?**
`git bisect` — binary search; script it with `bisect run ./test.sh` for automation.

**Q: Conventional Commits — why?**
`feat:`/`fix:`/`chore:` prefixes drive changelogs, semver bumps, and CI filters; PR titles often must match in trunk-based repos.

---

## 6. Recall — Sound Bites

- "Rebase rewrites, merge preserves — never rebase what others pulled."
- "revert is the only shared-safe undo."
- "Detached HEAD = commits on a limb; branch before you leave."
- "fetch is free; pull mutates."
