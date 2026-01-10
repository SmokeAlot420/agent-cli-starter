---
description: Show or change the current model
argument-hint: "[model-alias]"
---

Show or change the current AI model.

$ARGUMENTS

Available model aliases:
- `opus` - Claude Opus 4.5 (default, most capable)
- `sonnet` - Claude Sonnet 4 (faster, cheaper)
- `haiku` - Claude Haiku 3.5 (fastest, cheapest)
- `default` - Reset to default model

Examples:
- `/model` - Show current model
- `/model sonnet` - Switch to Sonnet
- `/model opus` - Switch to Opus
