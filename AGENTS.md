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
