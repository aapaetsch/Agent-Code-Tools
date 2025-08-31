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
import MathTools from "./tools/math-tools.js";

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
        exposedHeaders: ["Mcp-Session-Id", "MCP-Session-Id"],
      }),
    );

    app.get("/health", (_req: Request, res: Response): void => {
      res.status(200).send("ok\n");
    });

    // Don't apply JSON middleware to MCP path - let StreamableHTTPServerTransport handle raw body
    const jsonUnlessMcp = (req: Request, res: Response, next: () => void): void => {
      if (req.path === HTTP_PATH) {
        // For MCP path, don't consume the request body - let transport handle it
        return next();
      }
      return express.json({ limit: "2mb" })(req, res, next);
    };
    app.use(jsonUnlessMcp);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableDnsRebindingProtection: false, // Temporarily disable for debugging
      allowedHosts: ALLOWED_HOSTS,
      allowedOrigins: ALLOWED_ORIGINS.includes("*") ? undefined : ALLOWED_ORIGINS,
    });

    app.all(HTTP_PATH, async (req: Request, res: Response) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      
      try {
        // Comprehensive request logging
        console.error(`[${requestId}] === INCOMING REQUEST ===`);
        console.error(`[${requestId}] Method: ${req.method}`);
        console.error(`[${requestId}] URL: ${req.originalUrl || req.url}`);
        console.error(`[${requestId}] IP: ${req.ip || req.hostname || 'unknown'}`);
        console.error(`[${requestId}] User-Agent: ${req.headers['user-agent'] || 'none'}`);
        
        // Log all headers for debugging
        console.error(`[${requestId}] === HEADERS ===`);
        Object.entries(req.headers).forEach(([key, value]) => {
          console.error(`[${requestId}] ${key}: ${value}`);
        });
        
        // Handle case-insensitive session ID headers per MCP spec
        const sessionId = req.headers["mcp-session-id"] as string || 
                         req.headers["Mcp-Session-Id"] as string ||
                         req.headers["MCP-Session-Id"] as string;
        
        // Log protocol version header
        const protocolVersion = req.headers["mcp-protocol-version"] as string ||
                               req.headers["MCP-Protocol-Version"] as string;
        
        // Enhanced session and protocol logging
        console.error(`[${requestId}] === MCP DETAILS ===`);
        console.error(`[${requestId}] Session ID: ${sessionId || 'NONE'}`);
        console.error(`[${requestId}] Protocol Version: ${protocolVersion || 'NONE'}`);
        console.error(`[${requestId}] Accept: ${req.headers.accept || 'NONE'}`);
        console.error(`[${requestId}] Content-Type: ${req.headers["content-type"] || 'NONE'}`);
        console.error(`[${requestId}] Content-Length: ${req.headers["content-length"] || 'NONE'}`);
        
        // Don't log request body to avoid consuming the stream before StreamableHTTPServerTransport
        // The transport needs to read the raw body itself
        
        // Validate required MCP headers
        const missingHeaders = [];
        if (!req.headers["content-type"]) missingHeaders.push("Content-Type");
        if (!req.headers.accept) missingHeaders.push("Accept");
        if (!protocolVersion) missingHeaders.push("MCP-Protocol-Version");
        
        if (missingHeaders.length > 0) {
          console.error(`[${requestId}] ❌ MISSING REQUIRED HEADERS: ${missingHeaders.join(', ')}`);
        }
        
        // Validate Accept header format
        const acceptHeader = req.headers.accept;
        if (acceptHeader) {
          const hasJson = acceptHeader.includes('application/json');
          const hasStream = acceptHeader.includes('text/event-stream');
          console.error(`[${requestId}] Accept validation: JSON=${hasJson}, Stream=${hasStream}`);
          
          if (!hasJson && !hasStream) {
            console.error(`[${requestId}] ❌ INVALID ACCEPT HEADER: Must include application/json or text/event-stream`);
          }
        }
        
        console.error(`[${requestId}] === CALLING TRANSPORT ===`);
        
        // Override response methods to log the response
        const originalJson = res.json;
        const originalSend = res.send;
        const originalStatus = res.status;
        
        res.json = function(body) {
          console.error(`[${requestId}] === RESPONSE ===`);
          console.error(`[${requestId}] Status: ${res.statusCode}`);
          console.error(`[${requestId}] Response Headers:`, res.getHeaders());
          console.error(`[${requestId}] Response Body: ${JSON.stringify(body).substring(0, 500)}`);
          return originalJson.call(this, body);
        };
        
        res.send = function(body) {
          console.error(`[${requestId}] === RESPONSE ===`);
          console.error(`[${requestId}] Status: ${res.statusCode}`);
          console.error(`[${requestId}] Response Headers:`, res.getHeaders());
          console.error(`[${requestId}] Response Body: ${typeof body === 'string' ? body.substring(0, 500) : body}`);
          return originalSend.call(this, body);
        };
        
        res.status = function(code) {
          console.error(`[${requestId}] Setting status code: ${code}`);
          return originalStatus.call(this, code);
        };
        
        await transport.handleRequest(req, res);
        
        console.error(`[${requestId}] === REQUEST COMPLETED ===`);
        
      } catch (e) {
        console.error(`[${requestId}] ❌ TRANSPORT ERROR:`, e);
        console.error(`[${requestId}] Error stack:`, e instanceof Error ? e.stack : 'No stack trace');
        
        if (!res.headersSent) {
          console.error(`[${requestId}] Sending 500 error response`);
          res.status(500).json({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32603,
              message: "Internal error",
              data: {
                error: e instanceof Error ? e.message : String(e),
                timestamp: new Date().toISOString(),
                requestId: requestId
              }
            }
          });
        }
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
