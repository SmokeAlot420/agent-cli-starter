---
description: Execute a plan or task using PIV methodology
argument-hint: task or plan file
---

Execute the following task:

$ARGUMENTS

Follow the PIV methodology:

1. **Plan** - Understand what needs to be done
   - Identify all files to modify
   - Understand dependencies
   - Plan the order of changes

2. **Implement** - Make the changes
   - Write clean, well-typed code
   - Follow existing patterns in the codebase
   - Keep changes minimal and focused

3. **Validate** - Verify the implementation
   - Run type checking: `npm run typecheck`
   - Run linting: `npm run lint`
   - Run tests: `npm test`
   - Build verification: `npm run build`

4. **Iterate** - Fix any issues found
   - Address validation errors
   - Repeat until all checks pass

Report progress at each step.
