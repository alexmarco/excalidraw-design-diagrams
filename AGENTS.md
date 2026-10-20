# Agent Instructions

This repository contains an agent skill that creates `.excalidraw` diagrams and the tooling around it. Read [`README.md`](README.md) for the purpose of the project and [`docs/adr/`](docs/adr/) for the recorded design decisions before changing behavior.

## Commands

```bash
npm test    # runs the test suite with node:test
```

## Working rules

- Work test-first: write a failing test that describes the behavior, confirm it fails, then write the minimal code that makes it pass. Do not write all tests before the implementation.
- Ask before adding any new dependency (package or library) and explain why it is needed.
- Write commit messages following Conventional Commits (`type(scope): description`). Keep each commit to one logical change.
- Follow GitFlow: create `feature/*` and `bugfix/*` branches from `develop`, create `hotfix/*` branches from `main`, and never commit directly to `main`. Rebase branches onto their base before merging.
- Never skip git hooks.

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
