#!/usr/bin/env node

/**
 * MCP Server for Date Tools
 * Provides date parsing, formatting, and manipulation utilities through the Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DateTools } from './tools/date-tools.js';

class DateToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'date-tools-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'parse',
            description: 'Parse date from various string formats with flexible parsing options',
            inputSchema: {
              type: 'object',
              properties: {
                dateString: {
                  type: 'string',
                  description: 'Date string to parse'
                },
                options: {
                  type: 'object',
                  properties: {
                    format: { type: 'string', description: 'Expected input format (e.g., "YYYY-MM-DD")' },
                    timezone: { type: 'string', description: 'Timezone to assume for parsing', default: 'UTC' },
                    locale: { type: 'string', description: 'Locale for parsing', default: 'en-US' },
                    strict: { type: 'boolean', description: 'Use strict parsing mode', default: false }
                  },
                  description: 'Parsing options'
                }
              },
              required: ['dateString']
            }
          },
          {
            name: 'format',
            description: 'Format date to specified format string with customizable output patterns',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: ['string', 'number'],
                  description: 'Date to format (ISO string, timestamp, or Date object)'
                },
                format: {
                  type: 'string',
                  description: 'Output format pattern (e.g., "YYYY-MM-DD HH:mm:ss", "MM/DD/YYYY")'
                },
                options: {
                  type: 'object',
                  properties: {
                    timezone: { type: 'string', description: 'Target timezone for formatting', default: 'UTC' },
                    locale: { type: 'string', description: 'Locale for formatting', default: 'en-US' }
                  },
                  description: 'Formatting options'
                }
              },
              required: ['date', 'format']
            }
          },
          {
            name: 'convert',
            description: 'Convert date from one format to another with format transformation',
            inputSchema: {
              type: 'object',
              properties: {
                dateString: {
                  type: 'string',
                  description: 'Date string to convert'
                },
                fromFormat: {
                  type: 'string',
                  description: 'Source format pattern'
                },
                toFormat: {
                  type: 'string',
                  description: 'Target format pattern'
                },
                options: {
                  type: 'object',
                  properties: {
                    timezone: { type: 'string', description: 'Timezone for conversion', default: 'UTC' },
                    locale: { type: 'string', description: 'Locale for conversion', default: 'en-US' }
                  },
                  description: 'Conversion options'
                }
              },
              required: ['dateString', 'fromFormat', 'toFormat']
            }
          },
          {
            name: 'arithmetic',
            description: 'Perform date arithmetic operations like adding or subtracting time periods',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: ['string', 'number'],
                  description: 'Starting date'
                },
                operations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      unit: {
                        type: 'string',
                        enum: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'],
                        description: 'Time unit for the operation'
                      },
                      value: {
                        type: 'number',
                        description: 'Amount to add or subtract'
                      },
                      operation: {
                        type: 'string',
                        enum: ['add', 'subtract'],
                        description: 'Whether to add or subtract the value'
                      }
                    },
                    required: ['unit', 'value', 'operation']
                  },
                  description: 'Array of arithmetic operations to perform in sequence'
                }
              },
              required: ['date', 'operations']
            }
          },
          {
            name: 'compare',
            description: 'Compare two dates and calculate differences with various precision levels',
            inputSchema: {
              type: 'object',
              properties: {
                date1: {
                  type: ['string', 'number'],
                  description: 'First date to compare'
                },
                date2: {
                  type: ['string', 'number'],
                  description: 'Second date to compare'
                },
                options: {
                  type: 'object',
                  properties: {
                    precision: {
                      type: 'string',
                      enum: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'],
                      description: 'Precision level for the primary difference calculation',
                      default: 'milliseconds'
                    },
                    absolute: {
                      type: 'boolean',
                      description: 'Return absolute difference (always positive)',
                      default: false
                    }
                  },
                  description: 'Comparison options'
                }
              },
              required: ['date1', 'date2']
            }
          },
          {
            name: 'info',
            description: 'Get comprehensive information about a specific date including calendar details and relative information',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: ['string', 'number'],
                  description: 'Date to analyze'
                }
              },
              required: ['date']
            }
          },
          {
            name: 'validate',
            description: 'Validate date strings against formats and business rules with comprehensive validation options',
            inputSchema: {
              type: 'object',
              properties: {
                dateString: {
                  type: 'string',
                  description: 'Date string to validate'
                },
                format: {
                  type: 'string',
                  description: 'Expected format pattern (optional for auto-detection)'
                },
                options: {
                  type: 'object',
                  properties: {
                    strict: { type: 'boolean', description: 'Use strict format matching', default: false },
                    allowFuture: { type: 'boolean', description: 'Allow future dates', default: true },
                    allowPast: { type: 'boolean', description: 'Allow past dates', default: true },
                    minDate: { type: 'string', description: 'Minimum allowed date' },
                    maxDate: { type: 'string', description: 'Maximum allowed date' }
                  },
                  description: 'Validation options'
                }
              },
              required: ['dateString']
            }
          }
        ] as Tool[]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'No arguments provided'
              }, null, 2)
            }
          ],
          isError: true
        };
      }

      try {
        switch (name) {
          case 'parse': {
            const result = DateTools.parse(
              args.dateString as string, 
              args.options as any
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'format': {
            const result = DateTools.format(
              args.date as string | number, 
              args.format as string, 
              args.options as any
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'convert': {
            const result = DateTools.convert(
              args.dateString as string, 
              args.fromFormat as string, 
              args.toFormat as string, 
              args.options as any
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'arithmetic': {
            const result = DateTools.arithmetic(
              args.date as string | number, 
              (args.operations as any[]) || []
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'compare': {
            const result = DateTools.compare(
              args.date1 as string | number, 
              args.date2 as string | number, 
              args.options as any
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'info': {
            const result = DateTools.info(args.date as string | number);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          case 'validate': {
            const result = DateTools.validate(
              args.dateString as string, 
              args.format as string, 
              args.options as any
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Date Tools MCP server running on stdio');
  }
}

const server = new DateToolsServer();
server.run().catch(console.error);