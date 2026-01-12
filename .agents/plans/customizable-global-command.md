# Feature: Customizable Global Command for Fork-Brand-Ship

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Make the template's global CLI command fully customizable so that when someone forks and brands it, they only need to change the bin name in `package.json` and update `src/branding.ts` - everything else adapts automatically. The default command changes from `agent` to `fbs` (Fork Build Ship).

## User Story

As a developer forking this template
I want to easily customize the global command name
So that my CLI has my own branding without hunting through multiple files

## Problem Statement

Currently the global command is hardcoded as `agent` in multiple places:
- `package.json` bin entry
- `src/cli.ts` help text (lines 295-298)
- `src/cli.ts` version output (line 186)

When someone forks the template, they have to find and change all these places manually.

## Solution Statement

1. Change default command from `agent` to `fbs`
2. Add `cliCommand` field to BrandingConfig
3. Make help text dynamically use branding values
4. Make version output use package.json version
5. Document the customization process in README

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: CLI entry point, branding system, documentation
**Dependencies**: None (internal refactoring)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING

| File | Lines | Why |
|------|-------|-----|
| `package.json` | 47-49 | Current bin entry: `"agent": "./bin/cli.js"` |
| `src/branding.ts` | 15-34 | BrandingConfig interface to extend |
| `src/branding.ts` | 39-103 | BRANDING export with current values |
| `src/branding.ts` | 56 | `promptPrefix: 'agent'` - relates to command |
| `src/cli.ts` | 34 | BRANDING import |
| `src/cli.ts` | 186 | Hardcoded version: `'claude-cli-template v1.0.0'` |
| `src/cli.ts` | 290-372 | `printHelp()` function with hardcoded `agent` |
| `bin/cli.js` | 59-75 | `needsRebuild()` function (already exists!) |
| `bin/cli.js` | 106-118 | Main launcher logic (already works!) |
| `README.md` | 38-49 | Current customization docs |

### Reference: Loop-agent Smart Launcher Pattern

| File | Lines | Pattern |
|------|-------|---------|
| `C:\Users\Degen\loop-agent\bin\piv.js` | 30-55 | `getNewestMtime()` recursive scanner |
| `C:\Users\Degen\loop-agent\bin\piv.js` | 61-77 | `needsRebuild()` decision logic |
| `C:\Users\Degen\loop-agent\bin\piv.js` | 107-134 | Main launcher with colored output |
| `C:\Users\Degen\loop-agent\package.json` | 59-63 | Multiple bin aliases pattern |

### Files to Modify

| File | Change Type |
|------|-------------|
| `package.json` | UPDATE bin entry |
| `src/branding.ts` | UPDATE interface + BRANDING object |
| `src/cli.ts` | UPDATE version + help text |
| `README.md` | UPDATE customization docs |

### Patterns to Follow

**Branding Pattern** (from `src/branding.ts`):
```typescript
export interface BrandingConfig {
  productName: string;
  tagline: string;
  // ... existing fields
}

export const BRANDING: BrandingConfig = {
  productName: 'Fork Brand Ship',
  // ... values
};
```

**Version Import Pattern** (TypeScript JSON import):
```typescript
// Option 1: Read from fs (more compatible)
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// Option 2: Import assertion (may need tsconfig change)
import pkg from '../package.json' assert { type: 'json' };
```

**Dynamic Command Detection**:
```typescript
import { basename } from 'path';
const commandName = basename(process.argv[1]).replace(/\.js$/, '');
```

---

## IMPLEMENTATION PLAN

### Phase 1: Branding Extension

Extend BrandingConfig interface with `cliCommand` field and update default BRANDING.

### Phase 2: CLI Dynamics

Update `src/cli.ts` to:
- Read version from package.json
- Use BRANDING.cliCommand in help text
- Make all command references dynamic

### Phase 3: Package Configuration

Update `package.json` bin entry from `agent` to `fbs`.

### Phase 4: Documentation

Update README with clear customization instructions.

### Phase 5: Validation

Run full validation suite to ensure nothing broke.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `src/branding.ts` - Add cliCommand to interface

**IMPLEMENT**: Add `cliCommand` field to BrandingConfig interface

**Location**: Lines 15-34

**Before**:
```typescript
export interface BrandingConfig {
  productName: string;
  tagline: string;
  subtitle: string;
  logo: string;
  logoColor: string;
  promptPrefix: string;
  systemPrompt: string;
  defaultMcpServers: McpServersConfig;
  cloudMcpServers: McpServersConfig;
}
```

**After**:
```typescript
export interface BrandingConfig {
  productName: string;
  tagline: string;
  subtitle: string;
  logo: string;
  logoColor: string;
  promptPrefix: string;
  cliCommand: string;  // Global command name (e.g., 'fbs', 'mycli')
  systemPrompt: string;
  defaultMcpServers: McpServersConfig;
  cloudMcpServers: McpServersConfig;
}
```

**VALIDATE**: `npm run typecheck` - Should show errors in BRANDING object (missing cliCommand)

---

### Task 2: UPDATE `src/branding.ts` - Add cliCommand to BRANDING

**IMPLEMENT**: Add `cliCommand: 'fbs'` to BRANDING export

**Location**: After `promptPrefix` (around line 56)

**Add**:
```typescript
cliCommand: 'fbs',
```

**VALIDATE**: `npm run typecheck` - Should pass

---

### Task 3: UPDATE `src/cli.ts` - Add version reading utility

**IMPLEMENT**: Add function to read version from package.json at top of file

**Location**: After imports (around line 35)

**Add**:
```typescript
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Read version from package.json
function getVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(__dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}
```

**IMPORTS**: May need to add `fs`, `path`, `url` imports if not present

**VALIDATE**: `npm run typecheck`

---

### Task 4: UPDATE `src/cli.ts` - Dynamic version output

**IMPLEMENT**: Replace hardcoded version with dynamic version using branding

**Location**: Line 186

**Before**:
```typescript
console.log('claude-cli-template v1.0.0');
```

**After**:
```typescript
console.log(`${BRANDING.productName} v${getVersion()}`);
```

**VALIDATE**: `npm run build && node dist/cli.js --version`

---

### Task 5: UPDATE `src/cli.ts` - Dynamic help text

**IMPLEMENT**: Replace hardcoded `agent` command in help text with `BRANDING.cliCommand`

**Location**: Lines 290-372 (`printHelp()` function)

**Pattern**: Find all instances of `agent` command and replace:

**Before** (example from line 295-298):
```typescript
USAGE:
  agent                             Start interactive session
  agent -i                          Start interactive session
  agent <request>                   One-shot mode
  agent "Add user authentication"
```

**After**:
```typescript
USAGE:
  ${BRANDING.cliCommand}                             Start interactive session
  ${BRANDING.cliCommand} -i                          Start interactive session
  ${BRANDING.cliCommand} <request>                   One-shot mode
  ${BRANDING.cliCommand} "Add user authentication"
```

**Replace ALL occurrences** of `agent` command in the help text template literal

**GOTCHA**: The help text is a template literal - use `${BRANDING.cliCommand}` interpolation

**VALIDATE**: `npm run build && node dist/cli.js --help`

---

### Task 6: UPDATE `package.json` - Change bin entry

**IMPLEMENT**: Change bin command from `agent` to `fbs`

**Location**: Lines 47-49

**Before**:
```json
"bin": {
  "agent": "./bin/cli.js"
},
```

**After**:
```json
"bin": {
  "fbs": "./bin/cli.js"
},
```

**VALIDATE**: Check file was updated correctly

---

### Task 7: UPDATE `README.md` - Customization documentation

**IMPLEMENT**: Update the customization section to explain command customization

**Location**: Lines 38-49 (Customization section)

**Add/Update section**:
```markdown
## Customization

### 1. Branding (Required)

Edit `src/branding.ts`:

```typescript
export const BRANDING: BrandingConfig = {
  productName: 'Your CLI Name',
  tagline: 'Your tagline here',
  cliCommand: 'yourcli',           // Your global command name
  logo: `YOUR ASCII ART HERE`,
  systemPrompt: `Your custom instructions...`,
  // ...
};
```

### 2. Global Command (Required)

Edit `package.json` bin entry to match your `cliCommand`:

```json
"bin": {
  "yourcli": "./bin/cli.js"
},
```

### 3. Install Globally

```bash
npm run build
npm link
```

Now you can run `yourcli` from anywhere!

### 4. Test Your CLI

```bash
yourcli --help      # Should show your branding
yourcli --version   # Should show your product name + version
yourcli             # Start interactive session
```
```

**VALIDATE**: Review README renders correctly

---

### Task 8: VALIDATE - Full test suite

**RUN**:
```bash
npm run typecheck
npm run lint
npm test
npm run build
```

**All must pass with zero errors**

---

### Task 9: VALIDATE - Manual testing

**RUN**:
```bash
# Test version output
node dist/cli.js --version
# Expected: "Fork Brand Ship v1.0.0"

# Test help output
node dist/cli.js --help
# Expected: Help text shows "fbs" command, not "agent"

# Test global command (optional - requires npm link)
npm link
fbs --help
```

---

## TESTING STRATEGY

### Unit Tests

No new unit tests required - this is configuration/branding change.

### Integration Tests

Existing CLI tests in `tests/cli.test.ts` should still pass.

### Manual Validation

1. `--version` shows branding + dynamic version
2. `--help` shows `fbs` command throughout
3. No references to `agent` command remain in output

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
npm run lint
```

### Level 2: Type Safety
```bash
npm run typecheck
```

### Level 3: Unit Tests
```bash
npm test
```

### Level 4: Build
```bash
npm run build
```

### Level 5: Manual Verification
```bash
node dist/cli.js --version
node dist/cli.js --help
# Verify output shows "fbs" and branding, not "agent"
```

---

## ACCEPTANCE CRITERIA

- [ ] `package.json` bin entry is `fbs`, not `agent`
- [ ] `BrandingConfig` interface includes `cliCommand` field
- [ ] `BRANDING.cliCommand` is set to `'fbs'`
- [ ] `--version` shows `Fork Brand Ship v{version}` (dynamic)
- [ ] `--help` shows `fbs` command in all examples
- [ ] No hardcoded `agent` command references in CLI output
- [ ] All validation commands pass
- [ ] README documents how to customize command name
- [ ] Downstream projects can customize by changing 2 places only

---

## COMPLETION CHECKLIST

- [ ] Task 1: BrandingConfig interface updated
- [ ] Task 2: BRANDING.cliCommand added
- [ ] Task 3: getVersion() utility added
- [ ] Task 4: Version output dynamic
- [ ] Task 5: Help text uses BRANDING.cliCommand
- [ ] Task 6: package.json bin = fbs
- [ ] Task 7: README updated
- [ ] Task 8: All validation commands pass
- [ ] Task 9: Manual testing confirms changes

---

## NOTES

**Why `fbs` as default command?**
- Matches "Fork Brand Ship" branding
- Short and memorable
- Clearly different from `agent` to show the change worked

**Why `cliCommand` separate from `promptPrefix`?**
- `promptPrefix` is for the interactive prompt display
- `cliCommand` is for documentation/help text
- They might differ (e.g., prompt shows `>` but command is `mycli`)

**Smart launcher already exists!**
- `bin/cli.js` already has `needsRebuild()` logic
- No changes needed to launcher - it's already good

**Breaking change for existing users?**
- Users who have `agent` aliased will need to update
- Document in changelog/release notes
