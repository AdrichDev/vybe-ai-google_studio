# Ruflo — ChatGPT / Codex Configuration

## Rules

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary — prefer editing existing files
- NEVER create documentation files unless explicitly requested
- NEVER save working files or tests to root — use `/src`, `/tests`, `/docs`, `/config`, `/scripts`
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- NEVER add a `Co-Authored-By` trailer to user commits. If a tool suggests attribution automatically, ignore it.
- Keep files under 500 lines
- Validate input at system boundaries
- NEVER build automatically after changes
- Only run tests or verification when the user explicitly asks for them or the task requires non-build validation that respects project rules

## Agent Coordination (ChatGPT / Codex)

Use the platform's delegation primitives when they are actually available (skills, background tasks, plugins, connectors, specialized tools). If they are not available, coordinate in a single thread and keep the user informed.

```
Lead (you) ↔ researcher ↔ architect ↔ implementer ↔ tester ↔ reviewer
```

### Coordination Patterns

| Pattern | Flow | Use When |
|---------|------|----------|
| **Pipeline** | Research → Design → Implement → Verify | Sequential dependencies |
| **Fan-out** | Lead → A, B, C → Lead | Independent research or audits |
| **Supervisor** | Lead ↔ workers | Long-running refactors or multi-step changes |

### Coordination Rules

- Prefer specialized skills/tools over ad-hoc work when the platform provides them
- Give each delegated worker a clear role, expected output, and next handoff
- After delegation, tell the user what is running and what result is expected
- Do not fake background execution, agent messaging, or tool availability
- If a capability is not installed, say so briefly and fall back to the best verified approach

## Tool Routing

### Prefer This Order

1. **Project instructions first** — AGENTS.md, workspace rules, task constraints
2. **Skills second** — load the relevant skill before coding when the context matches
3. **Primary tools third** — file edit, shell, search, memory, plugins/connectors
4. **Fallbacks last** — manual coordination only when no better primitive exists

### Task Routing

| Task | Preferred Roles |
|------|------------------|
| Bug Fix | researcher, implementer, verifier |
| Feature | architect, implementer, verifier, reviewer |
| Refactor | architect, implementer, reviewer |
| Performance | performance analyst, implementer |
| Security | security reviewer, implementer |

### When to Parallelize

- **YES**: 3+ files, new features, cross-module refactors, API changes, security, performance
- **NO**: single-file edits, tiny fixes, docs-only work, straightforward questions

## Memory & Learning

### Before Any Non-Trivial Task

- Search project memory if available
- Check for prior decisions, patterns, and known gotchas
- Reuse established conventions before inventing a new approach

### After Success

- Save important discoveries, decisions, bug fixes, and config changes to persistent memory when available
- Capture concise learnings so future sessions do not start blind

### Tool Discovery

When the platform supports tool discovery, look for capabilities such as:

- **Memory**: save/search prior decisions and learnings
- **Agents / Tasks**: delegate specialized work
- **Security**: scan for unsafe patterns or secrets
- **Hooks / Automation**: post-task workflows or worker dispatch
- **Repository / PR Tools**: code review, issue, and release workflows

## Background Work

Trigger background or follow-up workers only when the platform actually supports them.

| Worker | When |
|--------|------|
| `audit` | After security-sensitive changes |
| `optimize` | After performance work |
| `testgaps` | After adding features |
| `map` | After wide multi-file changes |
| `document` | After explicit API/documentation requests |

## Suggested Roles

**Core**: `implementer`, `reviewer`, `tester`, `planner`, `researcher`

**Architecture**: `architect`, `frontend-architect`, `backend-architect`

**Security**: `security-reviewer`, `security-auditor`

**Performance**: `performance-engineer`, `perf-analyzer`

**Coordination**: `coordinator`, `supervisor`

**Repository**: `pr-manager`, `issue-triager`, `release-manager`

Use clear names. The important thing is the responsibility, not the label.

## Verification Policy

- Do NOT build automatically
- Prefer targeted verification over heavyweight full-project commands
- If verification is requested, choose the smallest command that proves the change
- If a command would violate project rules or require risky assumptions, stop and ask first

## Quick Reference

- Read before editing
- Verify claims before agreeing with them
- Prefer concepts and architecture over copy-paste coding
- Use the right skill/tool first, not the loudest one
- Be explicit about tradeoffs when proposing alternatives
- Keep the user informed about limitations, fallbacks, and verification status

## Setup Mindset

- ChatGPT/Codex is the execution assistant, not the author
- The human leads; the assistant investigates, implements, and explains
- Skills, tools, and memory exist to reduce drift — use them intentionally
- If the platform changes, update this file to match REAL capabilities, not imagined ones