/**
 * Toolchain - Error Parser
 * Parses output from various assemblers into IDE diagnostics
 */

import { AssemblerType, AssemblerDiagnostic, DiagnosticSeverity } from './toolchain-types';

/** Error pattern definition */
interface ErrorPattern {
    regex: RegExp;
    groups: {
        file?: number;
        line?: number;
        column?: number;
        message: number;
        severity?: number;
        code?: number;
    };
    defaultSeverity: DiagnosticSeverity;
}

/** NASM error patterns */
const NASM_PATTERNS: ErrorPattern[] = [
    {
        // nasm: file.asm:10: error: invalid combination of opcode and operands
        regex: /^(.+?):(\d+):\s*(error|warning|fatal):\s*(.+)$/i,
        groups: { file: 1, line: 2, severity: 3, message: 4 },
        defaultSeverity: 'error',
    },
    {
        // nasm: file.asm:10:5: error: ...
        regex: /^(.+?):(\d+):(\d+):\s*(error|warning|fatal):\s*(.+)$/i,
        groups: { file: 1, line: 2, column: 3, severity: 4, message: 5 },
        defaultSeverity: 'error',
    },
];

/** GAS (GNU Assembler) error patterns */
const GAS_PATTERNS: ErrorPattern[] = [
    {
        // file.s:10: Error: invalid instruction
        regex: /^(.+?):(\d+):\s*(Error|Warning):\s*(.+)$/i,
        groups: { file: 1, line: 2, severity: 3, message: 4 },
        defaultSeverity: 'error',
    },
    {
        // file.s:10:5: Error: ...
        regex: /^(.+?):(\d+):(\d+):\s*(Error|Warning):\s*(.+)$/i,
        groups: { file: 1, line: 2, column: 3, severity: 4, message: 5 },
        defaultSeverity: 'error',
    },
    {
        // Assembler messages:
        // file.s:10: Error: ...
        regex: /^(.+?):(\d+):\s*(.+)$/,
        groups: { file: 1, line: 2, message: 3 },
        defaultSeverity: 'error',
    },
];

/** LLVM-MC error patterns */
const LLVM_PATTERNS: ErrorPattern[] = [
    {
        // file.s:10:5: error: invalid operand
        regex: /^(.+?):(\d+):(\d+):\s*(error|warning|note):\s*(.+)$/i,
        groups: { file: 1, line: 2, column: 3, severity: 4, message: 5 },
        defaultSeverity: 'error',
    },
    {
        // <stdin>:10: error: ...
        regex: /^<stdin>:(\d+):\s*(error|warning|note):\s*(.+)$/i,
        groups: { line: 1, severity: 2, message: 3 },
        defaultSeverity: 'error',
    },
];

/** ARM Assembler error patterns */
const ARM_PATTERNS: ErrorPattern[] = [
    {
        // "file.s", line 10: Error: A1234E: Undefined symbol
        regex: /"(.+?)",\s*line\s*(\d+):\s*(Error|Warning):\s*(A\d+[EW]):\s*(.+)$/i,
        groups: { file: 1, line: 2, severity: 3, code: 4, message: 5 },
        defaultSeverity: 'error',
    },
    {
        // file.s:10: error: ...
        regex: /^(.+?):(\d+):\s*(error|warning):\s*(.+)$/i,
        groups: { file: 1, line: 2, severity: 3, message: 4 },
        defaultSeverity: 'error',
    },
];

/** Get patterns for assembler type */
function getPatternsForAssembler(type: AssemblerType): ErrorPattern[] {
    switch (type) {
        case 'nasm':
            return NASM_PATTERNS;
        case 'gas':
            return GAS_PATTERNS;
        case 'llvm':
            return LLVM_PATTERNS;
        case 'armasm':
            return ARM_PATTERNS;
    }
}

/** Convert severity string to DiagnosticSeverity */
function parseSeverity(
    text: string | undefined,
    defaultSeverity: DiagnosticSeverity
): DiagnosticSeverity {
    if (!text) return defaultSeverity;
    const lower = text.toLowerCase();
    if (lower.includes('error') || lower.includes('fatal')) return 'error';
    if (lower.includes('warning')) return 'warning';
    if (lower.includes('note') || lower.includes('info')) return 'info';
    return defaultSeverity;
}

/** Parse assembler output into diagnostics */
export function parseAssemblerOutput(
    output: string,
    assemblerType: AssemblerType,
    defaultFile: string
): AssemblerDiagnostic[] {
    const diagnostics: AssemblerDiagnostic[] = [];
    const patterns = getPatternsForAssembler(assemblerType);
    const lines = output.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        for (const pattern of patterns) {
            const match = trimmed.match(pattern.regex);
            if (match) {
                const file = pattern.groups.file ? match[pattern.groups.file] : defaultFile;

                const lineNum = pattern.groups.line ? parseInt(match[pattern.groups.line], 10) : 1;

                const column = pattern.groups.column
                    ? parseInt(match[pattern.groups.column], 10)
                    : undefined;

                const severityText = pattern.groups.severity
                    ? match[pattern.groups.severity]
                    : undefined;

                const message = match[pattern.groups.message];

                const code = pattern.groups.code ? match[pattern.groups.code] : undefined;

                diagnostics.push({
                    file,
                    line: lineNum,
                    column,
                    message,
                    severity: parseSeverity(severityText, pattern.defaultSeverity),
                    code,
                    source: assemblerType,
                    rawText: trimmed,
                });

                break; // First matching pattern wins
            }
        }
    }

    return diagnostics;
}

/** Detect likely assembler from file syntax */
export function detectAssemblerFromSyntax(content: string): {
    type: AssemblerType;
    confidence: number;
} {
    const indicators: Record<AssemblerType, number> = {
        nasm: 0,
        gas: 0,
        llvm: 0,
        armasm: 0,
    };

    // NASM indicators
    if (/\bsection\s+\.\w+/i.test(content)) indicators.nasm += 2;
    if (/\bdb\s+|dw\s+|dd\s+|dq\s+/i.test(content)) indicators.nasm += 2;
    if (/\bresb\s+|resw\s+|resd\s+|resq\s+/i.test(content)) indicators.nasm += 2;
    if (/\bequ\s+/i.test(content)) indicators.nasm += 1;
    if (/%include\s+/i.test(content)) indicators.nasm += 2;
    if (/%define\s+|%macro\s+/i.test(content)) indicators.nasm += 2;

    // GAS indicators
    if (/^\s*\.\w+\s/m.test(content)) indicators.gas += 2; // .text, .data, etc.
    if (/\.\s*(byte|short|long|quad|ascii|asciz)/i.test(content)) indicators.gas += 2;
    if (/\.\s*(global|globl|extern)/i.test(content)) indicators.gas += 1;
    if (/%\w+/.test(content)) indicators.gas += 1; // Register with % prefix
    if (/\$\d+/.test(content)) indicators.gas += 1; // Immediates with $

    // LLVM indicators
    if (/\.Lfunc_begin|\.Lfunc_end/i.test(content)) indicators.llvm += 3;
    if (/\.cfi_\w+/i.test(content)) indicators.llvm += 1; // Also in GAS

    // ARM indicators
    if (/\bAREA\s+|ENTRY\s+|END\s*$/im.test(content)) indicators.armasm += 3;
    if (/\bDCB\s+|DCD\s+|DCW\s+/i.test(content)) indicators.armasm += 2;

    // Find the max
    let maxType: AssemblerType = 'nasm';
    let maxScore = indicators.nasm;

    for (const type of ['gas', 'llvm', 'armasm'] as AssemblerType[]) {
        if (indicators[type] > maxScore) {
            maxScore = indicators[type];
            maxType = type;
        }
    }

    // Confidence based on score difference
    const totalScore = Object.values(indicators).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.25;

    return { type: maxType, confidence: Math.min(confidence * 1.5, 1) };
}
