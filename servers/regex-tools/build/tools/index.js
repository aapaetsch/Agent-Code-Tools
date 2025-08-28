#!/usr/bin/env node
"use strict";
/**
 * MCP Server for Regex Tools
 * Provides comprehensive regex utilities through the Model Context Protocol
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var regex_tools_js_1 = require("./tools/regex-tools.js");
var RegexToolsServer = /** @class */ (function () {
    function RegexToolsServer() {
        this.server = new index_js_1.Server({
            name: 'regex-tools-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    RegexToolsServer.prototype.setupErrorHandling = function () {
        var _this = this;
        this.server.onerror = function (error) {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.server.close()];
                    case 1:
                        _a.sent();
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    RegexToolsServer.prototype.setupToolHandlers = function () {
        var _this = this;
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        tools: [
                            {
                                name: 'regex_match_count',
                                description: 'Count the number of matches for a regex pattern in text',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to search in'
                                        },
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern to search for'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags (e.g., "gi" for global case-insensitive)',
                                            default: 'g'
                                        }
                                    },
                                    required: ['text', 'pattern']
                                }
                            },
                            {
                                name: 'regex_match',
                                description: 'Test if text matches a regex pattern and get first match details',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to test'
                                        },
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern to test against'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags',
                                            default: ''
                                        }
                                    },
                                    required: ['text', 'pattern']
                                }
                            },
                            {
                                name: 'regex_extract',
                                description: 'Extract all matches from text with detailed information',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to extract from'
                                        },
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern to extract'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags',
                                            default: 'g'
                                        }
                                    },
                                    required: ['text', 'pattern']
                                }
                            },
                            {
                                name: 'regex_replace',
                                description: 'Replace matches in text with replacement string',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to perform replacements on'
                                        },
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern to match'
                                        },
                                        replacement: {
                                            type: 'string',
                                            description: 'The replacement string'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags',
                                            default: 'g'
                                        }
                                    },
                                    required: ['text', 'pattern', 'replacement']
                                }
                            },
                            {
                                name: 'regex_split',
                                description: 'Split text by regex pattern',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to split'
                                        },
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern to split by'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags',
                                            default: ''
                                        },
                                        limit: {
                                            type: 'number',
                                            description: 'Maximum number of splits'
                                        }
                                    },
                                    required: ['text', 'pattern']
                                }
                            },
                            {
                                name: 'regex_extract_json',
                                description: 'Extract and parse JSON objects from text',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to extract JSON from'
                                        }
                                    },
                                    required: ['text']
                                }
                            },
                            {
                                name: 'regex_find_groups',
                                description: 'Find capture groups from regex matches',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to search in'
                                        },
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern with capture groups'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags',
                                            default: 'g'
                                        }
                                    },
                                    required: ['text', 'pattern']
                                }
                            },
                            {
                                name: 'regex_validate',
                                description: 'Validate if a regex pattern is syntactically correct',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern to validate'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags to validate with the pattern',
                                            default: ''
                                        }
                                    },
                                    required: ['pattern']
                                }
                            },
                            {
                                name: 'regex_tokenize',
                                description: 'Tokenize text using regex pattern as delimiter',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to tokenize'
                                        },
                                        pattern: {
                                            type: 'string',
                                            description: 'The regex pattern to use as delimiter (defaults to whitespace and punctuation)'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags',
                                            default: 'gu'
                                        }
                                    },
                                    required: ['text']
                                }
                            },
                            {
                                name: 'regex_normalize_whitespace',
                                description: 'Normalize whitespace in text with various options',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to normalize'
                                        },
                                        options: {
                                            type: 'object',
                                            properties: {
                                                trimStart: { type: 'boolean', default: true },
                                                trimEnd: { type: 'boolean', default: true },
                                                collapseSpaces: { type: 'boolean', default: true },
                                                removeLineBreaks: { type: 'boolean', default: false },
                                                normalizeLineBreaks: { type: 'boolean', default: true }
                                            },
                                            description: 'Normalization options'
                                        }
                                    },
                                    required: ['text']
                                }
                            },
                            {
                                name: 'regex_redact',
                                description: 'Redact sensitive information using regex patterns',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        text: {
                                            type: 'string',
                                            description: 'The text to redact from'
                                        },
                                        patterns: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: { type: 'string', description: 'Name for this redaction pattern' },
                                                    pattern: { type: 'string', description: 'Regex pattern to match sensitive data' },
                                                    replacement: { type: 'string', description: 'Replacement text', default: '[REDACTED]' }
                                                },
                                                required: ['name', 'pattern']
                                            },
                                            description: 'Array of redaction patterns'
                                        },
                                        flags: {
                                            type: 'string',
                                            description: 'Regex flags to use for all patterns',
                                            default: 'gi'
                                        }
                                    },
                                    required: ['text', 'patterns']
                                }
                            }
                        ]
                    }];
            });
        }); });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, name, args, result, result, result, result, result, result, result, result, result, result, result;
            return __generator(this, function (_b) {
                _a = request.params, name = _a.name, args = _a.arguments;
                try {
                    switch (name) {
                        case 'regex_match_count': {
                            result = regex_tools_js_1.RegexTools.matchCount(args.text, args.pattern, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_match': {
                            result = regex_tools_js_1.RegexTools.match(args.text, args.pattern, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_extract': {
                            result = regex_tools_js_1.RegexTools.extract(args.text, args.pattern, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_replace': {
                            result = regex_tools_js_1.RegexTools.replace(args.text, args.pattern, args.replacement, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_split': {
                            result = regex_tools_js_1.RegexTools.split(args.text, args.pattern, args.flags, args.limit);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_extract_json': {
                            result = regex_tools_js_1.RegexTools.extractJson(args.text);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_find_groups': {
                            result = regex_tools_js_1.RegexTools.findGroups(args.text, args.pattern, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_validate': {
                            result = regex_tools_js_1.RegexTools.validate(args.pattern, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_tokenize': {
                            result = regex_tools_js_1.RegexTools.tokenize(args.text, args.pattern, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_normalize_whitespace': {
                            result = regex_tools_js_1.RegexTools.normalizeWhitespace(args.text, args.options);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        case 'regex_redact': {
                            result = regex_tools_js_1.RegexTools.redact(args.text, args.patterns, args.flags);
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify(result, null, 2)
                                        }
                                    ]
                                }];
                        }
                        default:
                            throw new Error("Unknown tool: ".concat(name));
                    }
                }
                catch (error) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: "Tool execution failed: ".concat(error instanceof Error ? error.message : String(error))
                                    }, null, 2)
                                }
                            ],
                            isError: true
                        }];
                }
                return [2 /*return*/];
            });
        }); });
    };
    RegexToolsServer.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transport = new stdio_js_1.StdioServerTransport();
                        return [4 /*yield*/, this.server.connect(transport)];
                    case 1:
                        _a.sent();
                        console.error('Regex Tools MCP server running on stdio');
                        return [2 /*return*/];
                }
            });
        });
    };
    return RegexToolsServer;
}());
var server = new RegexToolsServer();
server.run().catch(console.error);
