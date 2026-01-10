---
description: Review code changes for quality and best practices
argument-hint: file path or code description
---

Review the following code or changes:

$ARGUMENTS

Focus your review on:

**1. Code Quality**
- Is the code clean and readable?
- Are functions/methods well-named and focused?
- Is there unnecessary complexity?

**2. Type Safety**
- Are all types properly annotated?
- Are there any `any` types that should be specific?
- Are return types explicit?

**3. Error Handling**
- Are errors properly caught and handled?
- Are edge cases considered?
- Is there appropriate logging?

**4. Performance**
- Any obvious performance issues?
- Unnecessary iterations or memory allocations?
- Async operations handled correctly?

**5. Security**
- Any potential security vulnerabilities?
- Input validation present where needed?
- Sensitive data handled appropriately?

**6. Testing**
- Is the code testable?
- Are important paths covered by tests?

Provide specific, actionable feedback with line numbers where applicable.
