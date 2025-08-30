#!/usr/bin/env node
/**
 * MCP Server for Regex Tools — stdio + HTTP (Streamable)
 *
 * Modes (choose with env vars):
 *   TRANSPORT=stdio        -> only stdio
 *   TRANSPORT=http         -> only HTTP
 *   TRANSPORT=both (default) -> both stdio and HTTP in one process
 */

// at top of index.ts, change the express import to include types
import express, { type Request, type Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { RegexTools } from "./tools/regex-tools.js";

// ---------- Config ----------
const TRANSPORT = (process.env.MCP_TRANSPORT || "both").toLowerCase(); // stdio | http | both
const HTTP_PORT = Number(process.env.PORT || process.env.HTTP_PORT || 3001);
const HTTP_PATH = process.env.HTTP_PATH || "/mcp"; // nginx can prefix/strip paths
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// If running on localhost, it's strongly recommended to set allowed hosts/origins explicitly
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "127.0.0.1,localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ---------- Server impl (your original logic preserved) ----------
class RegexToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: "regex-tools-server",
        version: "1.0.0",
    }, {
      capabilities: { tools: {} }
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "regex_match_count",
            description: "Count the number of matches for a regex pattern in text",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to search in" },
                pattern: { type: "string", description: "The regex pattern to search for" },
                flags: {
                  type: "string",
                  description: 'Regex flags (e.g., "gi" for global case-insensitive)',
                  default: "g",
                },
              },
              required: ["text", "pattern"],
            },
          },
          {
            name: "regex_match",
            description: "Test if text matches a regex pattern and get first match details",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to test" },
                pattern: { type: "string", description: "The regex pattern to test against" },
                flags: { type: "string", description: "Regex flags", default: "" },
              },
              required: ["text", "pattern"],
            },
          },
          {
            name: "regex_extract",
            description: "Extract all matches from text with detailed information",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to extract from" },
                pattern: { type: "string", description: "The regex pattern to extract" },
                flags: { type: "string", description: "Regex flags", default: "g" },
              },
              required: ["text", "pattern"],
            },
          },
          {
            name: "regex_replace",
            description: "Replace matches in text with replacement string",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to perform replacements on" },
                pattern: { type: "string", description: "The regex pattern to match" },
                replacement: { type: "string", description: "The replacement string" },
                flags: { type: "string", description: "Regex flags", default: "g" },
              },
              required: ["text", "pattern", "replacement"],
            },
          },
          {
            name: "regex_split",
            description: "Split text by regex pattern",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to split" },
                pattern: { type: "string", description: "The regex pattern to split by" },
                flags: { type: "string", description: "Regex flags", default: "" },
                limit: { type: "number", description: "Maximum number of splits" },
              },
              required: ["text", "pattern"],
            },
          },
          {
            name: "regex_extract_json",
            description: "Extract and parse JSON objects from text",
            inputSchema: {
              type: "object",
              properties: { text: { type: "string", description: "The text to extract JSON from" } },
              required: ["text"],
            },
          },
          {
            name: "regex_find_groups",
            description: "Find capture groups from regex matches",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to search in" },
                pattern: { type: "string", description: "The regex pattern with capture groups" },
                flags: { type: "string", description: "Regex flags", default: "g" },
              },
              required: ["text", "pattern"],
            },
          },
          {
            name: "regex_validate",
            description: "Validate if a regex pattern is syntactically correct",
            inputSchema: {
              type: "object",
              properties: {
                pattern: { type: "string", description: "The regex pattern to validate" },
                flags: { type: "string", description: "Regex flags to validate with the pattern", default: "" },
              },
              required: ["pattern"],
            },
          },
          {
            name: "regex_tokenize",
            description:
              "Tokenize text using regex pattern as delimiter",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to tokenize" },
                pattern: {
                  type: "string",
                  description: "The regex delimiter (defaults to whitespace and punctuation)",
                },
                flags: { type: "string", description: "Regex flags", default: "gu" },
              },
              required: ["text"],
            },
          },
          {
            name: "regex_normalize_whitespace",
            description: "Normalize whitespace in text with various options",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to normalize" },
                options: {
                  type: "object",
                  properties: {
                    trimStart: { type: "boolean", default: true },
                    trimEnd: { type: "boolean", default: true },
                    collapseSpaces: { type: "boolean", default: true },
                    removeLineBreaks: { type: "boolean", default: false },
                    normalizeLineBreaks: { type: "boolean", default: true },
                  },
                  description: "Normalization options",
                },
              },
              required: ["text"],
            },
          },
          {
            name: "regex_redact",
            description: "Redact sensitive information using regex patterns",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "The text to redact from" },
                patterns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Name for this redaction pattern" },
                      pattern: { type: "string", description: "Regex pattern to match sensitive data" },
                      replacement: { type: "string", description: "Replacement text", default: "[REDACTED]" },
                    },
                    required: ["name", "pattern"],
                  },
                  description: "Array of redaction patterns",
                },
                flags: { type: "string", description: "Regex flags to use for all patterns", default: "gi" },
              },
              required: ["text", "patterns"],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: "No arguments provided" }, null, 2) }],
          isError: true,
        };
      }

      try {
        switch (name) {
          case "regex_match_count": {
            const result = RegexTools.matchCount(args.text as string, args.pattern as string, (args.flags as string) || "g");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_match": {
            const result = RegexTools.match(args.text as string, args.pattern as string, (args.flags as string) || "");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_extract": {
            const result = RegexTools.extract(args.text as string, args.pattern as string, (args.flags as string) || "g");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_replace": {
            const result = RegexTools.replace(
              args.text as string,
              args.pattern as string,
              args.replacement as string,
              (args.flags as string) || "g",
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_split": {
            const result = RegexTools.split(
              args.text as string,
              args.pattern as string,
              (args.flags as string) || "",
              args.limit as number,
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_extract_json": {
            const result = RegexTools.extractJson(args.text as string);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_find_groups": {
            const result = RegexTools.findGroups(args.text as string, args.pattern as string, (args.flags as string) || "g");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_validate": {
            const result = RegexTools.validate(args.pattern as string, (args.flags as string) || "");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_tokenize": {
            const result = RegexTools.tokenize(args.text as string, args.pattern as string, (args.flags as string) || "gu");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_normalize_whitespace": {
            const result = RegexTools.normalizeWhitespace(args.text as string, args.options || {});
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "regex_redact": {
            const result = RegexTools.redact(args.text as string, (args.patterns as any[]) || [], (args.flags as string) || "gi");
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}` },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  // ----- stdio -----
  async runOnStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Regex Tools MCP server running on stdio");
  }

  // ----- HTTP (Streamable) -----
  async runOnHttp(): Promise<void> {
    const app = express();

    app.use(
      cors({
        origin: ALLOWED_ORIGINS.includes("*") ? true : ALLOWED_ORIGINS,
        credentials: true,
        exposedHeaders: ["Mcp-Session-Id"],
      }),
    );

    app.get("/health", (_req: Request, res: Response): void => {
      res.status(200).send("ok\n");
    });

    const jsonUnlessMcp = (req: Request, res: Response, next: () => void): void => {
      if (req.path === HTTP_PATH) {
        return next();
      }
      return express.json({ limit: "2mb" })(req, res, next);
    };
    app.use(jsonUnlessMcp);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableDnsRebindingProtection: true,
      allowedHosts: ALLOWED_HOSTS,
      allowedOrigins: ALLOWED_ORIGINS.includes("*") ? undefined : ALLOWED_ORIGINS,
    });

    app.all(HTTP_PATH, async (req: Request, res: Response) => {
      try {
        // Log incoming request for debugging
        console.error(`[HTTP] ${req.method} ${req.originalUrl || req.url} from ${req.ip || req.hostname}`);
        const sessionId = (req.headers["mcp-session-id"] as string | undefined) || (req.headers["Mcp-Session-Id"] as string | undefined);
        if (sessionId) console.error("MCP-Session-Id:", sessionId);
        try {
          console.error("Headers:", JSON.stringify(req.headers, null, 2));
        } catch {
          console.error("Headers: <unable to stringify>");
        }
        await transport.handleRequest(req, res);
      } catch (e) {
        console.error("[Transport error]", e);
        if (!res.headersSent) res.status(500).end();
      }
    });

    await this.server.connect(transport);

    app.listen(HTTP_PORT, () => {
      console.error(
        `Regex Tools MCP server (HTTP) listening on :${HTTP_PORT}${HTTP_PATH}  | allowedHosts=${ALLOWED_HOSTS.join(
          ",",
        )} | allowedOrigins=${ALLOWED_ORIGINS.join(",")}`,
      );
    });
  }

  async run(): Promise<void> {
    if (TRANSPORT === "stdio") {
      await this.runOnStdio();
    } else if (TRANSPORT === "http") {
      await this.runOnHttp();
    } else {
      // both
      await this.runOnStdio();
      await this.runOnHttp();
    }
  }
}

const server = new RegexToolsServer();
server.run().catch((err) => {
  console.error("[MCP Fatal]", err);
  process.exit(1);
});
