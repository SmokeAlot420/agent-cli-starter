---
description: Run the 5-level validation pyramid
argument-hint: optional focus area
---

Run validation checks using the 5-level validation pyramid:

$ARGUMENTS

**Level 1: Syntax & Style**
- Run linting: `npm run lint`
- Check for formatting issues

**Level 2: Type Safety**
- Run TypeScript: `npm run typecheck` or `npx tsc --noEmit`
- Ensure no type errors

**Level 3: Unit Tests**
- Run tests: `npm test`
- Check test coverage

**Level 4: Integration/Build**
- Build project: `npm run build`
- Verify no build errors

**Level 5: Review**
- Check for code quality issues
- Verify changes match requirements

Report results for each level:
- PASS / FAIL status
- Any errors found
- Suggested fixes for failures

Continue to higher levels only if previous levels pass.
