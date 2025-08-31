#!/usr/bin/env node
/**
 * MCP Server for String Tools — stdio + HTTP (Streamable)
 *
 * Modes (via env):
 *   TRANSPORT=stdio         -> stdio only
 *   TRANSPORT=http          -> HTTP only
 *   TRANSPORT=both (default)-> both in one process
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
import StringTools from "./tools/string-tools.js";

// ---------- Config ----------
const TRANSPORT = (process.env.MCP_TRANSPORT || "both").toLowerCase(); // stdio | http | both
const HTTP_PORT = Number(process.env.PORT || process.env.HTTP_PORT || 3003);
const HTTP_PATH = process.env.HTTP_PATH || "/mcp";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "127.0.0.1,localhost")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

class StringToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: "string-tools-server",
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
            name: "string_compare",
            description:
              "Compare two strings using various comparison methods including exact match, similarity, and containment",
            inputSchema: {
              type: "object",
              properties: {
                str1: { type: "string", description: "First string to compare" },
                str2: { type: "string", description: "Second string to compare" },
                method: {
                  type: "string",
                  enum: [
                    "exact",
                    "case_insensitive",
                    "length",
                    "levenshtein",
                    "similarity",
                    "contains",
                    "starts_with",
                    "ends_with",
                  ],
                  description: "Comparison method to use",
                  default: "exact",
                },
              },
              required: ["str1", "str2"],
            },
          },
          {
            name: "string_transform",
            description:
              "Apply various transformations to text including case changes, formatting, and string operations",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "Text to transform" },
                operations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: [
                          "uppercase",
                          "lowercase",
                          "title",
                          "camel",
                          "pascal",
                          "snake",
                          "kebab",
                          "reverse",
                          "trim",
                          "pad",
                        ],
                      },
                      options: {
                        type: "object",
                        description: "Options specific to the transformation type",
                      },
                    },
                    required: ["type"],
                  },
                  description: "Array of transformation operations to apply in sequence",
                },
              },
              required: ["text", "operations"],
            },
          },
          {
            name: "string_analyze",
            description:
              "Analyze string properties including character counts, word frequency, and text patterns",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "Text to analyze" },
              },
              required: ["text"],
            },
          },
          {
            name: "string_diff",
            description:
              "Find and highlight differences between two strings with various comparison options",
            inputSchema: {
              type: "object",
              properties: {
                str1: { type: "string", description: "First string for comparison" },
                str2: { type: "string", description: "Second string for comparison" },
                options: {
                  type: "object",
                  properties: {
                    ignoreCase: {
                      type: "boolean",
                      description: "Ignore case differences",
                      default: false,
                    },
                    ignoreWhitespace: {
                      type: "boolean",
                      description: "Ignore whitespace differences",
                      default: false,
                    },
                    wordLevel: {
                      type: "boolean",
                      description: "Compare at word level instead of character level",
                      default: false,
                    },
                  },
                  description: "Comparison options",
                },
              },
              required: ["str1", "str2"],
            },
          },
          {
            name: "string_validate",
            description:
              "Validate strings against various patterns and rules including email, URL, phone, and custom patterns",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", description: "Text to validate" },
                rules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: [
                          "email",
                          "url",
                          "phone",
                          "length",
                          "pattern",
                          "required",
                          "numeric",
                          "alpha",
                          "alphanumeric",
                        ],
                      },
                      options: { type: "object", description: "Rule-specific options" },
                      message: { type: "string", description: "Custom validation message" },
                    },
                    required: ["type"],
                  },
                  description: "Array of validation rules to apply",
                },
              },
              required: ["text", "rules"],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: "No arguments provided" },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        switch (name) {
          case "string_compare": {
            const result = StringTools.compare(
              args.str1 as string,
              args.str2 as string,
              (args.method as any) || "exact",
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "string_transform": {
            const result = StringTools.transform(
              args.text as string,
              (args.operations as any[]) || [],
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "string_analyze": {
            const result = StringTools.analyze(args.text as string);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "string_diff": {
            const result = StringTools.diff(
              args.str1 as string,
              args.str2 as string,
              args.options as any,
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "string_validate": {
            const result = StringTools.validate(
              args.text as string,
              (args.rules as any[]) || [],
            );
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
                {
                  success: false,
                  error: `Tool execution failed: ${
                    error instanceof Error ? error.message : String(error)
                  }`,
                },
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
    console.error("String Tools MCP server running on stdio");
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
        `String Tools MCP server (HTTP) listening on :${HTTP_PORT}${HTTP_PATH} | allowedHosts=${ALLOWED_HOSTS.join(
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

const server = new StringToolsServer();
server.run().catch((err) => {
  console.error("[MCP Fatal]", err);
  process.exit(1);
});
