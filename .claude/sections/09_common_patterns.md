# Common Patterns

## React Hook Structure

```typescript
export interface UseXxxOptions {
  onCallback?: (data: SomeType) => void;
  initialValue?: string;
}

export interface UseXxxReturn {
  value: string;
  isLoading: boolean;
  doAction: (input: string) => void;
}

export function useXxx(options: UseXxxOptions = {}): UseXxxReturn {
  const { onCallback, initialValue = '' } = options;

  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // Use refs for callbacks to avoid stale closures
  const onCallbackRef = useRef(onCallback);
  useEffect(() => {
    onCallbackRef.current = onCallback;
  }, [onCallback]);

  const doAction = useCallback((input: string) => {
    // Implementation using onCallbackRef.current
    onCallbackRef.current?.(result);
  }, []);

  return { value, isLoading, doAction };
}
```

## Agent SDK Usage

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const queryInstance = query({
  prompt: 'Your prompt here',
  options: {
    model: 'claude-sonnet-4-20250514',
    maxTurns: 10
  }
});

for await (const message of queryInstance) {
  // Process streaming messages
  if (message.type === 'assistant') {
    console.log(message.content);
  }
}
```

## Callback Refs Pattern

Avoid stale closures in React:

```typescript
const onMessageRef = useRef(onMessage);
useEffect(() => {
  onMessageRef.current = onMessage;
}, [onMessage]);

// Use in callbacks - always gets current value
const handleData = useCallback(() => {
  onMessageRef.current?.(data);
}, []);
```

## Error Handling

```typescript
try {
  const result = await operation();
  return { success: true, data: result };
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  return { success: false, error: message };
}
```

## Async Generator Streaming

```typescript
async *streamResponses(): AsyncGenerator<Message> {
  for await (const msg of this.query) {
    // Process and yield
    yield processMessage(msg);
  }
}
```
