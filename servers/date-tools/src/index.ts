#!/usr/bin/env node
/**
 * MCP Server for Date Tools — stdio + HTTP (Streamable)
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
import DateTools from "./tools/date-tools.js";

// ---------- Config ----------
const TRANSPORT = (process.env.MCP_TRANSPORT || "both").toLowerCase(); // stdio | http | both
const HTTP_PORT = Number(process.env.PORT || process.env.HTTP_PORT || 3004);
const HTTP_PATH = process.env.HTTP_PATH || "/mcp";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "127.0.0.1,localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

class DateToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: "date-tools-server",
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
    // --- tools list (unchanged from your file) ---
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "date_parse",
            description: "Parse date from various string formats with flexible parsing options",
            inputSchema: {
              type: "object",
              properties: {
                dateString: { type: "string", description: "Date string to parse" },
                options: {
                  type: "object",
                  properties: {
                    format: { type: "string", description: 'Expected input format (e.g., "YYYY-MM-DD")' },
                    timezone: { type: "string", description: "Timezone to assume for parsing", default: "UTC" },
                    locale: { type: "string", description: "Locale for parsing", default: "en-US" },
                    strict: { type: "boolean", description: "Use strict parsing mode", default: false },
                  },
                  description: "Parsing options",
                },
              },
              required: ["dateString"],
            },
          },
          {
            name: "date_format",
            description: "Format date to specified format string with customizable output patterns",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: ["string", "number"], description: "Date to format (ISO string, timestamp, or Date object)" },
                format: { type: "string", description: 'Output format (e.g., "YYYY-MM-DD HH:mm:ss", "MM/DD/YYYY")' },
                options: {
                  type: "object",
                  properties: {
                    timezone: { type: "string", description: "Target timezone for formatting", default: "UTC" },
                    locale: { type: "string", description: "Locale for formatting", default: "en-US" },
                  },
                  description: "Formatting options",
                },
              },
              required: ["date", "format"],
            },
          },
          {
            name: "date_convert",
            description: "Convert date from one format to another with format transformation",
            inputSchema: {
              type: "object",
              properties: {
                dateString: { type: "string", description: "Date string to convert" },
                fromFormat: { type: "string", description: "Source format pattern" },
                toFormat: { type: "string", description: "Target format pattern" },
                options: {
                  type: "object",
                  properties: {
                    timezone: { type: "string", description: "Timezone for conversion", default: "UTC" },
                    locale: { type: "string", description: "Locale for conversion", default: "en-US" },
                  },
                  description: "Conversion options",
                },
              },
              required: ["dateString", "fromFormat", "toFormat"],
            },
          },
          {
            name: "date_arithmetic",
            description: "Perform date arithmetic operations like adding or subtracting time periods",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: ["string", "number"], description: "Starting date" },
                operations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      unit: {
                        type: "string",
                        enum: ["years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"],
                        description: "Time unit for the operation",
                      },
                      value: { type: "number", description: "Amount to add or subtract" },
                      operation: { type: "string", enum: ["add", "subtract"], description: "Add or subtract" },
                    },
                    required: ["unit", "value", "operation"],
                  },
                  description: "Operations to perform",
                },
              },
              required: ["date", "operations"],
            },
          },
          {
            name: "date_compare",
            description: "Compare two dates and calculate differences with various precision levels",
            inputSchema: {
              type: "object",
              properties: {
                date1: { type: ["string", "number"], description: "First date" },
                date2: { type: ["string", "number"], description: "Second date" },
                options: {
                  type: "object",
                  properties: {
                    precision: {
                      type: "string",
                      enum: ["years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"],
                      default: "milliseconds",
                    },
                    absolute: { type: "boolean", default: false },
                  },
                  description: "Comparison options",
                },
              },
              required: ["date1", "date2"],
            },
          },
          {
            name: "date_info",
            description: "Get comprehensive information about a specific date including calendar details and relative information",
            inputSchema: {
              type: "object",
              properties: { date: { type: ["string", "number"], description: "Date to analyze" } },
              required: ["date"],
            },
          },
          {
            name: "date_validate",
            description: "Validate date strings against formats and business rules with comprehensive validation options",
            inputSchema: {
              type: "object",
              properties: {
                dateString: { type: "string", description: "Date string to validate" },
                format: { type: "string", description: "Expected format pattern (optional for auto-detection)" },
                options: {
                  type: "object",
                  properties: {
                    strict: { type: "boolean", default: false },
                    allowFuture: { type: "boolean", default: true },
                    allowPast: { type: "boolean", default: true },
                    minDate: { type: "string" },
                    maxDate: { type: "string" },
                  },
                  description: "Validation options",
                },
              },
              required: ["dateString"],
            },
          },
        ] as Tool[],
      };
    });

    // --- tool calls (unchanged from your file) ---
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
          case "date_parse": {
            const result = DateTools.parse(args.dateString as string, args.options as any);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "date_format": {
            const result = DateTools.format(args.date as string | number, args.format as string, args.options as any);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "date_convert": {
            const result = DateTools.convert(
              args.dateString as string,
              args.fromFormat as string,
              args.toFormat as string,
              args.options as any,
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "date_arithmetic": {
            const result = DateTools.arithmetic(args.date as string | number, (args.operations as any[]) || []);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "date_compare": {
            const result = DateTools.compare(
              args.date1 as string | number,
              args.date2 as string | number,
              args.options as any,
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "date_info": {
            const result = DateTools.info(args.date as string | number);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          case "date_validate": {
            const result = DateTools.validate(args.dateString as string, args.format as string, args.options as any);
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
    console.error("Date Tools MCP server running on stdio");
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
      // enableDnsRebindingProtection: false, // Temporarily disable for debugging
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
        `Date Tools MCP server (HTTP) listening on :${HTTP_PORT}${HTTP_PATH} | allowedHosts=${ALLOWED_HOSTS.join(
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

const server = new DateToolsServer();
server.run().catch((err) => {
  console.error("[MCP Fatal]", err);
  process.exit(1);
});
