# Phase P002 — Git Branch Strategy & Protection Rules

## Status: Pending

## Branch Strategy
```
main           — Production-ready code (protected)
develop       — Integration branch (protected)
feature/*     — Feature development branches
bugfix/*      — Bug fix branches
hotfix/*      — Emergency production fixes
```

## Branch Protection Rules
- Require pull request reviews (1 approval required)
- Require status checks to pass
- Require branches to be up to date
- Include administrators in protection

## Conventional Commits
```bash
feat(dispatch): add goroutine pool per region
fix(payments): correct Ozow payout amount
docs(blockchain): update deployment steps
test(ai): add unit tests
```

## Next Phase
[P003 — Terraform Remote State Backend](./P003_TERRAFORM_REMOTE_STATE.md)
