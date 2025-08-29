# Agent Code Tools

A collection of Model Context Protocol (MCP) servers providing various utilities and tools.

## Project Structure

```
Agent-Code-Tools/
├── package.json              # Root package.json with workspace configuration
├── tsconfig.json             # Root TypeScript configuration
├── .gitignore               # Git ignore rules
├── README.md                # This file
└── servers/                 # Individual MCP servers
    ├── regex-tools/         # Regex utilities server
    │   ├── package.json     # Server-specific dependencies
    │   ├── tsconfig.json    # Server-specific TypeScript config
    │   ├── src/
    │   │   ├── index.ts     # Main server entry point
    │   │   └── tools/
    │   │       └── regex-tools.ts  # Regex tools implementation
    │   └── build/           # Compiled TypeScript output
    ├── math-tools/          # Mathematical calculation server
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   └── tools/
    │   │       └── math-tools.ts
    │   └── build/
    ├── string-tools/        # String manipulation server
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   └── tools/
    │   │       └── string-tools.ts
    │   └── build/
    └── date-tools/          # Date processing server
        ├── package.json
        ├── tsconfig.json
        ├── src/
        │   ├── index.ts
        │   └── tools/
        │       └── date-tools.ts
        └── build/
```

## Available Servers

### 1. Regex Tools Server (`servers/regex-tools/`)

A comprehensive regex utilities server providing the following tools:

- **regex_match_count**: Count matches for a pattern
- **regex_match**: Test if text matches a pattern
- **regex_extract**: Extract all matches with details
- **regex_replace**: Replace matches with replacement text
- **regex_split**: Split text using regex pattern
- **regex_extract_json**: Extract and parse JSON objects from text
- **regex_find_groups**: Find and return capture groups
- **regex_validate**: Validate regex pattern syntax
- **regex_tokenize**: Tokenize text using regex delimiters
- **regex_normalize_whitespace**: Normalize whitespace with various options
- **regex_redact**: Redact sensitive information using patterns

### 2. Math Tools Server (`servers/math-tools/`)

Mathematical calculations and number utilities:

- **calculate**: Perform basic arithmetic operations (+, -, *, /, parentheses)
- **compare**: Compare two numbers with various operators (>, <, >=, <=, ==, etc.)
- **parse_numbers**: Extract and parse numbers from text with filtering options
- **format_number**: Format numbers with currency, percentage, and custom separators
- **sanitize_number**: Clean numeric strings by removing invalid characters
- **statistics**: Calculate statistical measures (mean, median, mode, std dev, etc.)

### 3. String Tools Server (`servers/string-tools/`)

String manipulation and comparison utilities:

- **compare**: Compare strings using various methods (exact, similarity, levenshtein, etc.)
- **transform**: Apply transformations (case changes, camelCase, snake_case, etc.)
- **analyze**: Analyze string properties (character counts, word frequency, patterns)
- **diff**: Find differences between strings with highlighting options
- **validate**: Validate strings against patterns (email, URL, phone, custom regex)

### 4. Date Tools Server (`servers/date-tools/`)

Date parsing, formatting, and manipulation utilities:

- **parse**: Parse dates from various string formats with flexible options
- **format**: Format dates to specified patterns (YYYY-MM-DD, MM/DD/YYYY, etc.)
- **convert**: Convert dates from one format to another
- **arithmetic**: Add/subtract time periods (years, months, days, hours, etc.)
- **compare**: Compare dates and calculate differences with various precision
- **info**: Get comprehensive date information (calendar details, relative info)
- **validate**: Validate dates against formats and business rules

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker Desktop for HTTP support

### Example Tool Usage

Each server provides focused, specialized functionality. Here are some examples:

#### Regex Tools Examples
```json
{
  "tool": "regex_match_count",
  "arguments": {
    "text": "The quick brown fox jumps over the lazy dog",
    "pattern": "\\w+",
    "flags": "g"
  }
}

{
  "tool": "regex_redact",
  "arguments": {
    "text": "My SSN is 123-45-6789 and email is john@example.com",
    "patterns": [
      {
        "name": "SSN",
        "pattern": "\\d{3}-\\d{2}-\\d{4}",
        "replacement": "[SSN REDACTED]"
      }
    ]
  }
}
```

#### Math Tools Examples
```json
{
  "tool": "calculate",
  "arguments": {
    "expression": "(10 + 5) * 2 - 8 / 4"
  }
}

{
  "tool": "compare",
  "arguments": {
    "num1": 15.7,
    "num2": 15.70,
    "operator": "==="
  }
}

{
  "tool": "statistics",
  "arguments": {
    "numbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
}
```

#### String Tools Examples
```json
{
  "tool": "compare",
  "arguments": {
    "str1": "Hello World",
    "str2": "hello world",
    "method": "case_insensitive"
  }
}

{
  "tool": "transform",
  "arguments": {
    "text": "Hello World Example",
    "operations": [
      {"type": "snake"},
      {"type": "uppercase"}
    ]
  }
}

{
  "tool": "validate",
  "arguments": {
    "text": "user@example.com",
    "rules": [
      {"type": "email"},
      {"type": "length", "options": {"min": 5, "max": 100}}
    ]
  }
}
```

#### Date Tools Examples
```json
{
  "tool": "parse",
  "arguments": {
    "dateString": "2024-03-15 14:30:00"
  }
}

{
  "tool": "arithmetic",
  "arguments": {
    "date": "2024-01-01",
    "operations": [
      {"unit": "months", "value": 6, "operation": "add"},
      {"unit": "days", "value": 15, "operation": "subtract"}
    ]
  }
}

{
  "tool": "format",
  "arguments": {
    "date": "2024-03-15T14:30:00Z",
    "format": "MM/DD/YYYY at HH:mm"
  }
}
```
## Configuration

Each server can be configured in Claude Desktop or other MCP clients by adding entries to the MCP configuration file.

### Claude Desktop Configuration Example

```json
{
  "mcpServers": {
    "regex-tools": {
      "command": "node",
      "args": ["/path/to/mcp-servers/servers/regex-tools/build/index.js"]
    },
    "math-tools": {
      "command": "node", 
      "args": ["/path/to/mcp-servers/servers/math-tools/build/index.js"]
    },
    "string-tools": {
      "command": "node",
      "args": ["/path/to/mcp-servers/servers/string-tools/build/index.js"]  
    },
    "date-tools": {
      "command": "node",
      "args": ["/path/to/mcp-servers/servers/date-tools/build/index.js"]
    }
  }
}
```

## License

MIT License - see LICENSE file for details