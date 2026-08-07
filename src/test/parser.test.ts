import { describe, it, expect } from "vitest";

// String-aware extractJsonObjects logic
function extractJsonObjects(text: string): { events: Record<string, unknown>[], remaining: string } {
  const events: Record<string, unknown>[] = [];
  let remaining = text;

  let depth = 0;
  let start = -1;
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < remaining.length; i++) {
    const char = remaining[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          const jsonStr = remaining.slice(start, i + 1);
          try {
            const event = JSON.parse(jsonStr);
            if (event && event.type) {
              events.push(event);
            }
          } catch {
            // Skip invalid
          }
          remaining = remaining.slice(i + 1);
          i = -1;
          start = -1;
        }
      }
    }
  }

  if (start !== -1) {
    remaining = remaining.slice(start);
  } else if (depth === 0) {
    remaining = '';
  }

  return { events, remaining };
}

describe("extractJsonObjects", () => {
  it("should extract JSON object containing curly braces inside string literals", () => {
    const sampleStream = `
      {"type":"vulnerability","title":"XSS","codeSnippet":"function test() { alert('hello'); }","severity":"high"}
      {"type":"fileComplete","file":"app.js","linesScanned":50}
    `;

    const { events } = extractJsonObjects(sampleStream);
    expect(events).toHaveLength(2);
    expect(events[0].title).toBe("XSS");
    expect(events[0].codeSnippet).toBe("function test() { alert('hello'); }");
    expect(events[1].type).toBe("fileComplete");
  });
});
