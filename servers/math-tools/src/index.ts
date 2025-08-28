#!/usr/bin/env node

/**
 * MCP Server for Math Tools
 * Provides mathematical calculations and number utilities through the Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MathTools } from './tools/math-tools.js';


class MathToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'math-tools-server',
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
            name: 'calculate',
            description: 'Perform basic arithmetic calculations with support for +, -, *, /, and parentheses',
            inputSchema: {
              type: 'object',
              properties: {
                expression: {
                  type: 'string',
                  description: 'Mathematical expression to evaluate (e.g., "2 + 3 * 4", "(10 - 5) / 2")'
                }
              },
              required: ['expression']
            }
          },
          {
            name: 'compare',
            description: 'Compare two numbers using various comparison operators',
            inputSchema: {
              type: 'object',
              properties: {
                num1: {
                  type: ['number', 'string'],
                  description: 'First number to compare'
                },
                num2: {
                  type: ['number', 'string'],
                  description: 'Second number to compare'
                },
                operator: {
                  type: 'string',
                  enum: ['>', '<', '>=', '<=', '==', '!=', '===', '!=='],
                  description: 'Comparison operator to use'
                }
              },
              required: ['num1', 'num2', 'operator']
            }
          },
          {
            name: 'parse_numbers',
            description: 'Extract and parse numbers from text with various options',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Text to extract numbers from'
                },
                options: {
                  type: 'object',
                  properties: {
                    integersOnly: { type: 'boolean', description: 'Only extract integers', default: false },
                    includeNegative: { type: 'boolean', description: 'Include negative numbers', default: true },
                    includeDecimals: { type: 'boolean', description: 'Include decimal numbers', default: true }
                  },
                  description: 'Parsing options'
                }
              },
              required: ['text']
            }
          },
          {
            name: 'format_number',
            description: 'Format numbers with various display options including currency, percentages, and custom separators',
            inputSchema: {
              type: 'object',
              properties: {
                number: {
                  type: ['number', 'string'],
                  description: 'Number to format'
                },
                options: {
                  type: 'object',
                  properties: {
                    decimals: { type: 'number', description: 'Number of decimal places', default: 2 },
                    thousandsSeparator: { type: 'string', description: 'Thousands separator character', default: ',' },
                    decimalSeparator: { type: 'string', description: 'Decimal separator character', default: '.' },
                    prefix: { type: 'string', description: 'Prefix to add', default: '' },
                    suffix: { type: 'string', description: 'Suffix to add', default: '' },
                    percentage: { type: 'boolean', description: 'Format as percentage', default: false },
                    currency: { type: 'string', description: 'Currency code for currency formatting' },
                    locale: { type: 'string', description: 'Locale for formatting', default: 'en-US' }
                  },
                  description: 'Formatting options'
                }
              },
              required: ['number']
            }
          },
          {
            name: 'sanitize_number',
            description: 'Clean and sanitize numeric strings by removing invalid characters and normalizing format',
            inputSchema: {
              type: 'object',
              properties: {
                input: {
                  type: 'string',
                  description: 'String to sanitize into a number'
                },
                options: {
                  type: 'object',
                  properties: {
                    allowDecimals: { type: 'boolean', description: 'Allow decimal numbers', default: true },
                    allowNegative: { type: 'boolean', description: 'Allow negative numbers', default: true },
                    thousandsSeparator: { type: 'string', description: 'Expected thousands separator', default: ',' },
                    decimalSeparator: { type: 'string', description: 'Expected decimal separator', default: '.' }
                  },
                  description: 'Sanitization options'
                }
              },
              required: ['input']
            }
          },
          {
            name: 'statistics',
            description: 'Calculate statistical measures (mean, median, mode, etc.) for a set of numbers',
            inputSchema: {
              type: 'object',
              properties: {
                numbers: {
                  type: 'array',
                  items: {
                    type: ['number', 'string']
                  },
                  description: 'Array of numbers to analyze'
                }
              },
              required: ['numbers']
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
          case 'calculate': {
            const result = MathTools.calculate(args.expression as string);
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
            const result = MathTools.compare(
              args.num1 as number | string, 
              args.num2 as number | string, 
              args.operator as '>' | '<' | '>=' | '<=' | '==' | '!=' | '===' | '!=='
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

          case 'parse_numbers': {
            const result = MathTools.parseNumbers(
              args.text as string, 
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

          case 'format_number': {
            const result = MathTools.formatNumber(
              args.number as number | string, 
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

          case 'sanitize_number': {
            const result = MathTools.sanitizeNumber(
              args.input as string, 
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

          case 'statistics': {
            const result = MathTools.statistics(args.numbers as (number | string)[]);
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
    console.error('String Tools MCP server running on stdio');
  }
}

const server = new MathToolsServer();
server.run().catch((err) => {
  console.error('[MCP Fatal]', err);
  process.exit(1);
});