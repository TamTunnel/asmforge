/**
 * GDB Debug Adapter - MI Protocol Parser
 * Parses GDB Machine Interface output
 */

import { GdbMiResult, GdbMiRecordType } from './gdb-types';

/** Parse a GDB MI output line */
export function parseGdbMiOutput(line: string): GdbMiResult | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Match token (optional number at start)
    let token: number | undefined;
    let rest = trimmed;

    const tokenMatch = trimmed.match(/^(\d+)/);
    if (tokenMatch) {
        token = parseInt(tokenMatch[1], 10);
        rest = trimmed.slice(tokenMatch[0].length);
    }

    // Determine record type from first character
    let type: GdbMiRecordType;
    let recordData = rest;

    switch (rest[0]) {
        case '^': // Result record
            type = 'result';
            recordData = rest.slice(1);
            break;
        case '*': // Exec (async) record
            type = 'exec';
            recordData = rest.slice(1);
            break;
        case '+': // Status (async) record
            type = 'status';
            recordData = rest.slice(1);
            break;
        case '=': // Notify (async) record
            type = 'notify';
            recordData = rest.slice(1);
            break;
        case '~': // Console stream
            type = 'console';
            recordData = rest.slice(1);
            break;
        case '@': // Target stream
            type = 'target';
            recordData = rest.slice(1);
            break;
        case '&': // Log stream
            type = 'log';
            recordData = rest.slice(1);
            break;
        case '(':
            // Prompt "(gdb)" - ignore
            return null;
        default:
            // Unknown, treat as console output
            type = 'console';
            break;
    }

    // For stream records, extract the string
    if (['console', 'target', 'log'].includes(type)) {
        const stringMatch = recordData.match(/^"(.*)"/);
        if (stringMatch) {
            return {
                type,
                class: 'output',
                token,
                data: { text: unescapeGdbString(stringMatch[1]) },
                raw: line,
            };
        }
        return {
            type,
            class: 'output',
            token,
            data: { text: recordData },
            raw: line,
        };
    }

    // Parse result/async record: class,result1=value1,result2=value2,...
    const classMatch = recordData.match(/^([a-zA-Z][a-zA-Z0-9_-]*)/);
    if (!classMatch) {
        return {
            type,
            class: 'unknown',
            token,
            data: {},
            raw: line,
        };
    }

    const recordClass = classMatch[1];
    const dataString = recordData.slice(classMatch[0].length);

    // Parse the results
    const data = parseGdbMiData(dataString);

    return {
        type,
        class: recordClass,
        token,
        data,
        raw: line,
    };
}

/** Parse GDB MI data (comma-separated key=value pairs) */
function parseGdbMiData(input: string): Record<string, any> {
    const result: Record<string, any> = {};
    let pos = 0;

    // Skip leading comma
    while (pos < input.length && (input[pos] === ',' || input[pos] === ' ')) {
        pos++;
    }

    while (pos < input.length) {
        // Parse key
        const keyMatch = input.slice(pos).match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/);
        if (!keyMatch) break;

        const key = keyMatch[1];
        pos += keyMatch[0].length;

        // Parse value
        const [value, consumed] = parseGdbMiValue(input.slice(pos));
        result[key] = value;
        pos += consumed;

        // Skip comma
        while (pos < input.length && (input[pos] === ',' || input[pos] === ' ')) {
            pos++;
        }
    }

    return result;
}

/** Parse a single GDB MI value, returns [value, charactersConsumed] */
function parseGdbMiValue(input: string): [any, number] {
    if (!input) return ['', 0];

    // String value
    if (input[0] === '"') {
        let pos = 1;
        let value = '';
        while (pos < input.length) {
            if (input[pos] === '\\' && pos + 1 < input.length) {
                // Escape sequence
                value += unescapeChar(input[pos + 1]);
                pos += 2;
            } else if (input[pos] === '"') {
                pos++;
                break;
            } else {
                value += input[pos];
                pos++;
            }
        }
        return [value, pos];
    }

    // List value (array)
    if (input[0] === '[') {
        const [arr, consumed] = parseGdbMiList(input);
        return [arr, consumed];
    }

    // Tuple value (object)
    if (input[0] === '{') {
        const [obj, consumed] = parseGdbMiTuple(input);
        return [obj, consumed];
    }

    // Unquoted value (rare, treat as string up to comma/end)
    const match = input.match(/^([^,}\]]+)/);
    if (match) {
        return [match[1].trim(), match[0].length];
    }

    return ['', 0];
}

/** Parse a GDB MI list [value, value, ...] */
function parseGdbMiList(input: string): [any[], number] {
    if (input[0] !== '[') return [[], 0];

    const result: any[] = [];
    let pos = 1;

    while (pos < input.length && input[pos] !== ']') {
        // Skip whitespace and commas
        while (pos < input.length && (input[pos] === ',' || input[pos] === ' ')) {
            pos++;
        }

        if (input[pos] === ']') break;

        // Check for key=value in list (named elements)
        const keyMatch = input.slice(pos).match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/);
        if (keyMatch) {
            pos += keyMatch[0].length;
            const [value, consumed] = parseGdbMiValue(input.slice(pos));
            result.push({ [keyMatch[1]]: value });
            pos += consumed;
        } else {
            const [value, consumed] = parseGdbMiValue(input.slice(pos));
            if (consumed > 0) {
                result.push(value);
                pos += consumed;
            } else {
                break;
            }
        }
    }

    if (pos < input.length && input[pos] === ']') {
        pos++;
    }

    return [result, pos];
}

/** Parse a GDB MI tuple {key=value, ...} */
function parseGdbMiTuple(input: string): [Record<string, any>, number] {
    if (input[0] !== '{') return [{}, 0];

    const result: Record<string, any> = {};
    let pos = 1;

    while (pos < input.length && input[pos] !== '}') {
        // Skip whitespace and commas
        while (pos < input.length && (input[pos] === ',' || input[pos] === ' ')) {
            pos++;
        }

        if (input[pos] === '}') break;

        // Parse key=value
        const keyMatch = input.slice(pos).match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/);
        if (!keyMatch) break;

        const key = keyMatch[1];
        pos += keyMatch[0].length;

        const [value, consumed] = parseGdbMiValue(input.slice(pos));
        result[key] = value;
        pos += consumed;
    }

    if (pos < input.length && input[pos] === '}') {
        pos++;
    }

    return [result, pos];
}

/** Unescape a single character */
function unescapeChar(char: string): string {
    switch (char) {
        case 'n':
            return '\n';
        case 't':
            return '\t';
        case 'r':
            return '\r';
        case '\\':
            return '\\';
        case '"':
            return '"';
        default:
            return char;
    }
}

/** Unescape a GDB string */
function unescapeGdbString(str: string): string {
    let result = '';
    let i = 0;
    while (i < str.length) {
        if (str[i] === '\\' && i + 1 < str.length) {
            result += unescapeChar(str[i + 1]);
            i += 2;
        } else {
            result += str[i];
            i++;
        }
    }
    return result;
}

/** Format a GDB MI command */
export function formatGdbMiCommand(
    token: number,
    command: string,
    args?: Record<string, string>
): string {
    let cmd = `${token}-${command}`;

    if (args) {
        for (const [key, value] of Object.entries(args)) {
            // Escape and quote the value if needed
            const escapedValue =
                value.includes(' ') || value.includes('"')
                    ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
                    : value;
            cmd += ` --${key} ${escapedValue}`;
        }
    }

    return cmd;
}
