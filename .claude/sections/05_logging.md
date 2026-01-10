# Logging

## Structured Logging Pattern

**Format:** `{domain}.{component}.{action}_{state}`

Examples:
- `session.create_started`
- `agent.message_received`
- `ui.picker_opened`
- `mcp.server_connected`

## Console Logging

For CLI applications, use console methods appropriately:

```typescript
// Info - normal operations
console.log('session.create_completed', { sessionId });

// Warnings - non-critical issues
console.warn('mcp.server_timeout', { server: 'github' });

// Errors - failures
console.error('agent.stream_failed', { error: err.message });

// Debug - verbose output (check verbose flag)
if (verbose) {
  console.log('DEBUG:', { tool, params });
}
```

## Standard States

- `_started` - Operation beginning
- `_completed` - Successful completion
- `_failed` - Error occurred
- `_received` - Data received
- `_created` - Resource created

## Error Logging

Always include context:
```typescript
console.error('feature.action_failed', {
  error: err.message,
  errorType: err.name,
  context: { userId, sessionId }
});
```

## Debug Mode

The `--verbose` / `-V` flag enables detailed logging:
- Tool calls and results
- Stream events
- Internal state changes

Keep production logs minimal; use verbose for debugging.
