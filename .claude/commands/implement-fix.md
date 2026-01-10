---
description: Implement fix from RCA document for GitHub issue
argument-hint: [github-issue-id]
---

# Implement Fix: GitHub Issue #$ARGUMENTS

## Prerequisites

**This command implements fixes for GitHub issues based on RCA documents:**
- Working in a local Git repository with GitHub origin
- RCA document exists at `docs/rca/issue-$ARGUMENTS.md`
- GitHub CLI installed (optional, for status updates)

## RCA Document to Reference

Read RCA: `docs/rca/issue-$ARGUMENTS.md`

**Optional - View GitHub issue for context:**
```bash
gh issue view $ARGUMENTS
```

## Implementation Instructions

### 1. Read and Understand RCA

- Read the ENTIRE RCA document thoroughly
- Review the GitHub issue details
- Understand the root cause
- Review the proposed fix strategy
- Note all files to modify
- Review testing requirements

### 2. Verify Current State

Before making changes:
- Confirm the issue still exists
- Check current state of affected files
- Review any recent changes

### 3. Implement the Fix

Following the "Proposed Fix" section of the RCA:

**For each file to modify:**

#### a. Read the existing file
- Understand current implementation
- Locate the specific code mentioned in RCA

#### b. Make the fix
- Implement the change as described
- Follow the fix strategy exactly
- Maintain code style and conventions
- Add comments if the fix is non-obvious

#### c. Handle related changes
- Update any related code
- Ensure consistency
- Update imports if needed

### 4. Add/Update Tests

Following the "Testing Requirements" from RCA:

**Create test cases for:**
1. Verify the fix resolves the issue
2. Test edge cases related to the bug
3. Ensure no regression

**Test implementation pattern:**
```python
def test_issue_[ID]_fix():
    """Test that issue #[ID] is fixed."""
    # Arrange - set up scenario that caused bug
    # Act - execute code that previously failed
    # Assert - verify it now works correctly
```

### 5. Run Validation

Execute validation commands from RCA:

```bash
# Run linters
[from RCA validation commands]

# Run type checking
[from RCA validation commands]

# Run tests
[from RCA validation commands]
```

**If validation fails:**
- Fix the issues
- Re-run validation
- Don't proceed until all pass

### 6. Verify Fix

**Manually verify:**
- Follow reproduction steps from RCA
- Confirm issue no longer occurs
- Test edge cases
- Check for unintended side effects

### 7. Update Documentation

If needed:
- Update code comments
- Update API documentation
- Update README if user-facing

## Output Report

### Fix Implementation Summary

**GitHub Issue #$ARGUMENTS**: [Brief title]

### Changes Made

**Files Modified:**
1. **[file-path]**
   - Change: [What was changed]
   - Lines: [Line numbers]

### Tests Added

**Test Files:**
1. **[test-file-path]**
   - Test cases: [List test functions]

### Validation Results

```bash
# Linter: ✓
# Type check: ✓
# Tests: ✓ (X passed)
```

### Verification

- ✅ Followed reproduction steps - issue resolved
- ✅ Tested edge cases
- ✅ No new issues introduced

### Ready for Commit

**Suggested commit message:**
```
fix(scope): resolve GitHub issue #$ARGUMENTS - [brief description]

[Summary of what was fixed and how]

Fixes #$ARGUMENTS
```

**Note:** Using `Fixes #$ARGUMENTS` will auto-close the issue when merged.

### Optional: Update GitHub Issue

```bash
gh issue comment $ARGUMENTS --body "Fix implemented. Ready for review."
```

## Notes

- If RCA document is missing, run `/rca $ARGUMENTS` first
- If you discover the RCA was incorrect, update it
- If additional issues found, create separate RCAs
- Follow project coding standards exactly
