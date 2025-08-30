#!/usr/bin/env node
/**
 * MCP Server for Math Tools — stdio + HTTP (Streamable)
 *
 * Modes (via env):
 *   TRANSPORT=stdio          -> stdio only
 *   TRANSPORT=http           -> HTTP only
 *   TRANSPORT=both (default) -> both in one process
 */

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
import { MathTools } from "./tools/math-tools.js";

// ---------- Config ----------
const TRANSPORT = (process.env.MCP_TRANSPORT || "both").toLowerCase(); // stdio | http | both
const HTTP_PORT = Number(process.env.PORT || process.env.HTTP_PORT || 3002);
const HTTP_PATH = process.env.HTTP_PATH || "/mcp";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "127.0.0.1,localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

class MathToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: "math-tools-server",
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
            name: "math_calculate",
            description:
              "Perform basic arithmetic calculations with support for +, -, *, /, and parentheses",
            inputSchema: {
              type: "object",
              properties: {
                expression: {
                  type: "string",
                  description:
                    'Mathematical expression to evaluate (e.g., "2 + 3 * 4", "(10 - 5) / 2")',
                },
              },
              required: ["expression"],
            },
          },
          {
            name: "math_compare",
            description: "Compare two numbers using various comparison operators",
            inputSchema: {
              type: "object",
              properties: {
                num1: { type: ["number", "string"], description: "First number" },
                num2: { type: ["number", "string"], description: "Second number" },
                operator: {
                  type: "string",
                  enum: [">", "<", ">=", "<=", "==", "!=", "===", "!=="],
                  description: "Comparison operator",
                },
              },
              required: ["num1", "num2", "operator"],
            },
          },
          {
            name: "math_parse_numbers",
            description: "Extract and parse numbers from text with various options",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "Text to extract numbers from" },
                options: {
                  type: "object",
                  properties: {
                    integersOnly: { type: "boolean", default: false },
                    includeNegative: { type: "boolean", default: true },
                    includeDecimals: { type: "boolean", default: true },
                  },
                },
              },
              required: ["text"],
            },
          },
          {
            name: "math_format_number",
            description:
              "Format numbers (decimals, separators, currency, percentage, prefix/suffix)",
            inputSchema: {
              type: "object",
              properties: {
                number: { type: ["number", "string"], description: "Number to format" },
                options: {
                  type: "object",
                  properties: {
                    decimals: { type: "number", default: 2 },
                    thousandsSeparator: { type: "string", default: "," },
                    decimalSeparator: { type: "string", default: "." },
                    prefix: { type: "string", default: "" },
                    suffix: { type: "string", default: "" },
                    percentage: { type: "boolean", default: false },
                    currency: { type: "string" },
                    locale: { type: "string", default: "en-US" },
                  },
                },
              },
              required: ["number"],
            },
          },
          {
            name: "math_sanitize_number",
            description:
              "Clean a numeric string by removing invalid characters and normalizing format",
            inputSchema: {
              type: "object",
              properties: {
                input: { type: "string", description: "String to sanitize into a number" },
                options: {
                  type: "object",
                  properties: {
                    allowDecimals: { type: "boolean", default: true },
                    allowNegative: { type: "boolean", default: true },
                    thousandsSeparator: { type: "string", default: "," },
                    decimalSeparator: { type: "string", default: "." },
                  },
                },
              },
              required: ["input"],
            },
          },
          {
            name: "math_statistics",
            description: "Compute stats (mean, median, mode, etc.) for a set of numbers",
            inputSchema: {
              type: "object",
              properties: {
                numbers: {
                  type: "array",
                  items: { type: ["number", "string"] },
                  description: "Array of numbers to analyze",
                },
              },
              required: ["numbers"],
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
          case "math_calculate": {
            const result = MathTools.calculate(args.expression as string);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "math_compare": {
            const result = MathTools.compare(
              args.num1 as number | string,
              args.num2 as number | string,
              args.operator as ">" | "<" | ">=" | "<=" | "==" | "!=" | "===" | "!==",
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "math_parse_numbers": {
            const result = MathTools.parseNumbers(args.text as string, args.options as any);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "math_format_number": {
            const result = MathTools.formatNumber(args.number as number | string, args.options as any);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "math_sanitize_number": {
            const result = MathTools.sanitizeNumber(args.input as string, args.options as any);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "math_statistics": {
            const result = MathTools.statistics(args.numbers as (number | string)[]);
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
    console.error("Math Tools MCP server running on stdio");
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
        `Math Tools MCP server (HTTP) listening on :${HTTP_PORT}${HTTP_PATH} | allowedHosts=${ALLOWED_HOSTS.join(
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
      await this.runOnStdio();
      await this.runOnHttp();
    }
  }
}

const server = new MathToolsServer();
server.run().catch((err) => {
  console.error("[MCP Fatal]", err);
  process.exit(1);
});
