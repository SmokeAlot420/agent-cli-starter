---
description: Analyze and document root cause for a GitHub issue
argument-hint: [github-issue-id]
---

# Root Cause Analysis: GitHub Issue #$ARGUMENTS

## Objective

Investigate GitHub issue #$ARGUMENTS from this repository, identify the root cause, and document findings for future implementation.

**Prerequisites:**
- Working in a local Git repository with GitHub origin
- GitHub CLI installed and authenticated (`gh auth status`)
- Valid GitHub issue ID from this repository

## Investigation Process

### 1. Fetch GitHub Issue Details

**Use GitHub CLI to retrieve issue information:**

```bash
gh issue view $ARGUMENTS
```

This fetches:
- Issue title and description
- Reporter and creation date
- Labels and status
- Comments and discussion

### 2. Search Codebase

**Identify relevant code:**
- Search for components mentioned in issue
- Find related functions, classes, or modules
- Check similar implementations
- Look for patterns or recent changes

Use grep/search to find:
- Error messages from issue
- Related function names
- Component identifiers

### 3. Review Recent History

Check recent changes to affected areas:

```bash
git log --oneline -20 -- [relevant-paths]
```

Look for:
- Recent modifications to affected code
- Related bug fixes
- Refactorings that might have introduced the issue

### 4. Investigate Root Cause

**Analyze the code to determine:**
- What is the actual bug or issue?
- Why is it happening?
- What was the original intent?
- Is this a logic error, edge case, or missing validation?
- Are there related issues or symptoms?

**Consider:**
- Input validation failures
- Edge cases not handled
- Race conditions or timing issues
- Incorrect assumptions
- Missing error handling
- Integration issues between components

### 5. Assess Impact

**Determine:**
- How widespread is this issue?
- What features are affected?
- Are there workarounds?
- What is the severity?
- Could this cause data corruption or security issues?

### 6. Propose Fix Approach

**Design the solution:**
- What needs to be changed?
- Which files will be modified?
- What is the fix strategy?
- Are there alternative approaches?
- What testing is needed?
- Are there any risks or side effects?

## Output: Create RCA Document

Save analysis as: `docs/rca/issue-$ARGUMENTS.md`

### Required RCA Document Structure

```markdown
# Root Cause Analysis: GitHub Issue #[ID]

## Issue Summary

- **GitHub Issue ID**: #[ID]
- **Issue URL**: [Link to GitHub issue]
- **Title**: [Issue title]
- **Reporter**: [GitHub username]
- **Severity**: [Critical/High/Medium/Low]

## Problem Description

[Clear description of the issue]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

## Reproduction

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Observe issue]

## Root Cause

### Affected Components

- **Files**: [List of affected files]
- **Functions/Classes**: [Specific code locations]

### Analysis

[Detailed explanation of the root cause]

**Code Location:**
```
[File path:line number]
[Relevant code snippet]
```

## Impact Assessment

**Scope:** [How widespread]
**Affected Features:** [List]
**Severity Justification:** [Why this level]

## Proposed Fix

### Fix Strategy

[High-level approach]

### Files to Modify

1. **[file-path]**
   - Changes: [What needs to change]
   - Reason: [Why this change fixes it]

### Testing Requirements

1. [Test case - verify fix works]
2. [Test case - verify no regression]

**Validation Commands:**
```bash
[Exact commands to verify fix]
```

## Next Steps

1. Review this RCA document
2. Run: `/implement-fix $ARGUMENTS` to implement
3. Run: `/commit` after implementation
```

## Notes

- Be thorough in investigation
- Document all findings even if not directly related
- Consider edge cases and related issues
- The RCA document is used by `/implement-fix` command
