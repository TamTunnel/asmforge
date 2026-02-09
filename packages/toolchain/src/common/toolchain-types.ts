/**
 * Toolchain - Common Types
 * Defines assemblers, build configurations, and diagnostics
 */

/** Supported assembler types */
export type AssemblerType = 'nasm' | 'gas' | 'llvm' | 'armasm';

/** Architecture targets */
export type ArchitectureTarget = 'x86' | 'x86_64' | 'arm' | 'arm64' | 'riscv32' | 'riscv64';

/** Output formats */
export type OutputFormat =
    | 'elf32'
    | 'elf64'
    | 'macho32'
    | 'macho64'
    | 'win32'
    | 'win64'
    | 'bin'
    | 'coff';

/** Assembler configuration */
export interface AssemblerConfig {
    type: AssemblerType;
    executable: string;
    architecture: ArchitectureTarget;
    outputFormat: OutputFormat;
    additionalFlags: string[];
    includePaths: string[];
    defines: Record<string, string>;
}

/** Build task configuration */
export interface BuildConfig {
    name: string;
    sourceFile: string;
    outputFile?: string;
    assembler: AssemblerConfig;
    linkAfterAssemble: boolean;
    linkerFlags: string[];
    generateListing: boolean;
    generateMap: boolean;
}

/** Diagnostic severity matching IDE standards */
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

/** Parsed diagnostic from assembler output */
export interface AssemblerDiagnostic {
    file: string;
    line: number;
    column?: number;
    message: string;
    severity: DiagnosticSeverity;
    code?: string;
    source: AssemblerType;
    rawText: string;
}

/** Build result */
export interface BuildResult {
    success: boolean;
    exitCode: number;
    outputFile?: string;
    listingFile?: string;
    diagnostics: AssemblerDiagnostic[];
    stdout: string;
    stderr: string;
    duration: number;
}

/** Assembler detection result */
export interface AssemblerDetection {
    detected: AssemblerType;
    confidence: number; // 0-1
    indicators: string[];
}

/** Default assembler configurations */
export const DEFAULT_ASSEMBLER_CONFIGS: Record<AssemblerType, Partial<AssemblerConfig>> = {
    nasm: {
        type: 'nasm',
        executable: 'nasm',
        architecture: 'x86_64',
        outputFormat: 'elf64',
        additionalFlags: ['-g', '-F', 'dwarf'],
    },
    gas: {
        type: 'gas',
        executable: 'as',
        architecture: 'x86_64',
        outputFormat: 'elf64',
        additionalFlags: ['--gdwarf-5'],
    },
    llvm: {
        type: 'llvm',
        executable: 'llvm-mc',
        architecture: 'x86_64',
        outputFormat: 'elf64',
        additionalFlags: ['-g'],
    },
    armasm: {
        type: 'armasm',
        executable: 'armasm',
        architecture: 'arm64',
        outputFormat: 'elf64',
        additionalFlags: ['-g'],
    },
};

/** Format-specific flags for each assembler */
export const ASSEMBLER_FORMAT_FLAGS: Record<AssemblerType, Record<OutputFormat, string[]>> = {
    nasm: {
        elf32: ['-f', 'elf32'],
        elf64: ['-f', 'elf64'],
        macho32: ['-f', 'macho32'],
        macho64: ['-f', 'macho64'],
        win32: ['-f', 'win32'],
        win64: ['-f', 'win64'],
        bin: ['-f', 'bin'],
        coff: ['-f', 'coff'],
    },
    gas: {
        elf32: ['--32'],
        elf64: ['--64'],
        macho32: [],
        macho64: [],
        win32: [],
        win64: [],
        bin: [],
        coff: [],
    },
    llvm: {
        elf32: ['--filetype=obj', '-arch=x86'],
        elf64: ['--filetype=obj', '-arch=x86-64'],
        macho32: ['--filetype=obj', '-arch=x86'],
        macho64: ['--filetype=obj', '-arch=x86-64'],
        win32: ['--filetype=obj'],
        win64: ['--filetype=obj'],
        bin: [],
        coff: [],
    },
    armasm: {
        elf32: ['--target=arm-linux-gnueabihf'],
        elf64: ['--target=aarch64-linux-gnu'],
        macho32: [],
        macho64: ['--target=arm64-apple-darwin'],
        win32: [],
        win64: ['--target=aarch64-windows-msvc'],
        bin: [],
        coff: [],
    },
};
