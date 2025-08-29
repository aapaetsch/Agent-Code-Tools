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
import { StringTools } from "./tools/string-tools.js";

// ---------- Config ----------
const TRANSPORT = (process.env.TRANSPORT || "both").toLowerCase(); // stdio | http | both
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
            name: "compare",
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
            name: "transform",
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
            name: "analyze",
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
            name: "diff",
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
            name: "validate",
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
          case "compare": {
            const result = StringTools.compare(
              args.str1 as string,
              args.str2 as string,
              (args.method as any) || "exact",
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "transform": {
            const result = StringTools.transform(
              args.text as string,
              (args.operations as any[]) || [],
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "analyze": {
            const result = StringTools.analyze(args.text as string);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "diff": {
            const result = StringTools.diff(
              args.str1 as string,
              args.str2 as string,
              args.options as any,
            );
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "validate": {
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
    app.use(express.json({ limit: "2mb" }));

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

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableDnsRebindingProtection: true,
      allowedHosts: ALLOWED_HOSTS,
      allowedOrigins: ALLOWED_ORIGINS.includes("*") ? undefined : ALLOWED_ORIGINS,
    });

    app.all(HTTP_PATH, async (req: Request, res: Response): Promise<void> => {
      await transport.handleRequest(req, res);
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
