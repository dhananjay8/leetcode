# Git & Version Control

## Core Concepts
```
Working Directory → (git add) → Staging Area → (git commit) → Local Repo → (git push) → Remote
```

## Essential Commands

### Setup & Config
```bash
git config --global user.name "Name"
git config --global user.email "email@example.com"
git init                        # initialize new repo
git clone <url>                 # clone remote repo
```

### Daily Workflow
```bash
git status                      # what's changed?
git add .                       # stage all changes
git add file.txt                # stage specific file
git commit -m "feat: add login" # commit with message
git push origin main            # push to remote
git pull origin main            # fetch + merge from remote
git fetch                       # download changes without merging
```

### Branching
```bash
git branch                      # list branches
git branch feature-login        # create branch
git checkout feature-login      # switch branch
git checkout -b feature-login   # create + switch (shortcut)
git switch feature-login        # modern alternative to checkout
git branch -d feature-login     # delete branch (safe)
git branch -D feature-login     # force delete
```

### Merging & Rebasing
```bash
git merge feature-login         # merge branch into current
git rebase main                 # rebase current branch onto main

# Merge: creates a merge commit, preserves history
# Rebase: rewrites history, creates linear timeline (cleaner)
```

**Merge vs Rebase:**
- **Merge**: Safe for shared branches (main/develop). Creates merge commit.
- **Rebase**: Good for feature branches before merging. Linear history. **Never rebase shared branches.**

### Undoing Changes
```bash
git stash                       # save changes temporarily
git stash pop                   # restore stashed changes
git reset HEAD~1                # undo last commit (keep changes)
git reset --hard HEAD~1         # undo last commit (discard changes)
git revert <hash>               # create new commit that undoes a commit (safe)
git checkout -- file.txt        # discard unstaged changes to file
```

### Cherry-pick & Log
```bash
git cherry-pick <hash>          # apply specific commit to current branch
git log --oneline --graph       # visual commit history
git log -n 5                    # last 5 commits
git diff                        # unstaged changes
git diff --staged               # staged changes
git blame file.txt              # who changed each line
```

## Git Workflows

### GitFlow
```
main (production) ← develop ← feature branches
                  ← release branches
                  ← hotfix branches
```

### Trunk-Based Development (Preferred at most companies)
```
main (always deployable) ← short-lived feature branches (< 1 day)
                          Feature flags for incomplete features
```

## Interview Questions

**Q: How do you resolve a merge conflict?**
1. Git marks conflicts in files with `<<<<<<<`, `=======`, `>>>>>>>`
2. Edit file to choose correct version
3. `git add` the resolved file
4. `git commit`

**Q: Difference between `git pull` and `git fetch`?**
`fetch` downloads changes but doesn't modify your working directory. `pull` = `fetch` + `merge`.

**Q: What is a detached HEAD?**
HEAD points to a specific commit instead of a branch. Any commits made will be lost if you switch branches without creating a branch from that point.

**Q: How do you squash commits?**
```bash
git rebase -i HEAD~3            # interactive rebase last 3 commits
# Change "pick" to "squash" for commits you want to combine
```
