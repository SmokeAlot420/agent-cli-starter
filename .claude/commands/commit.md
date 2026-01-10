---
description: Create a git commit with conventional format
argument-hint: optional commit message
---

Create a git commit for the current changes.

$ARGUMENTS

Follow this workflow:

1. **Check status**: Run `git status` to see all changes
2. **Review diff**: Run `git diff` to understand what changed
3. **Stage files**: Stage appropriate files (avoid committing generated files, .env, etc.)
4. **Create commit**: Use conventional commit format

**Conventional Commit Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

**Examples:**
- `feat(auth): add OAuth2 login support`
- `fix(api): handle null response from server`
- `refactor(utils): simplify date formatting logic`

Keep the description concise (50 chars or less). Use the body for additional context if needed.
