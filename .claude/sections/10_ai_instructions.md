# AI Coding Assistant Instructions

When working with this codebase:

## Before Making Changes

1. **Read existing code first** - Understand patterns before modifying
2. **Check the architecture** - Know where files belong
3. **Look for similar implementations** - Follow existing patterns

## During Implementation

4. **Type everything** - No implicit any, full type annotations
5. **Use `.js` extensions** - All ESM imports need the extension
6. **Follow React hook patterns** - UseXxxReturn interface, callback refs
7. **Keep it simple** - KISS and YAGNI principles

## After Changes

8. **Run validation**:
   ```bash
   npm run typecheck   # Must pass
   npm test            # All tests must pass
   npm run build       # Must succeed
   ```

9. **Test manually** - Run the CLI and verify behavior

## Key Rules

- **Type Safety**: Non-negotiable, TypeScript strict mode
- **ESM Imports**: Always use `.js` extension
- **KISS**: Simple solutions over clever abstractions
- **YAGNI**: Don't build until needed

## Validation Checklist

Before completing any task:

- [ ] All type annotations present
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] No `any` types without justification
- [ ] ESM imports use `.js` extension
- [ ] React hooks follow UseXxxReturn pattern

## Don't

- Don't skip type annotations
- Don't use `any` without explicit reason
- Don't forget `.js` in imports
- Don't commit without running validations
- Don't add features that aren't needed (YAGNI)
- Don't over-engineer simple solutions
