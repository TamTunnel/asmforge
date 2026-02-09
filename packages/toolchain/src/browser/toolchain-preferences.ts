/**
 * Toolchain - Preferences Schema
 */

import { AssemblerType, ArchitectureTarget, OutputFormat } from '../common/toolchain-types';

export interface PreferenceSchema {
    type: string;
    properties: Record<string, any>;
}

export const TOOLCHAIN_PREFERENCE_SCHEMA: PreferenceSchema = {
    type: 'object',
    properties: {
        'asmforge.assembler.default': {
            type: 'string',
            enum: ['nasm', 'gas', 'llvm', 'armasm'],
            default: 'nasm',
            description: 'Default assembler to use',
        },
        'asmforge.assembler.architecture': {
            type: 'string',
            enum: ['x86', 'x86_64', 'arm', 'arm64', 'riscv32', 'riscv64'],
            default: 'x86_64',
            description: 'Target architecture',
        },
        'asmforge.assembler.outputFormat': {
            type: 'string',
            enum: ['elf32', 'elf64', 'macho32', 'macho64', 'win32', 'win64', 'bin', 'coff'],
            default: 'elf64',
            description: 'Output object format',
        },
        'asmforge.assembler.autoDetect': {
            type: 'boolean',
            default: true,
            description: 'Auto-detect assembler from file syntax',
        },
        'asmforge.assembler.additionalFlags': {
            type: 'string',
            default: '',
            description: 'Additional flags to pass to the assembler',
        },
        'asmforge.assembler.includePaths': {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: 'Additional include paths for assembler',
        },
        'asmforge.linker.flags': {
            type: 'string',
            default: '-nostdlib',
            description: 'Flags to pass to the linker',
        },
        'asmforge.build.generateListing': {
            type: 'boolean',
            default: false,
            description: 'Generate listing file when assembling',
        },
        'asmforge.paths.nasm': {
            type: 'string',
            default: 'nasm',
            description: 'Path to NASM executable',
        },
        'asmforge.paths.gas': {
            type: 'string',
            default: 'as',
            description: 'Path to GNU Assembler (as) executable',
        },
        'asmforge.paths.llvm': {
            type: 'string',
            default: 'llvm-mc',
            description: 'Path to LLVM-MC executable',
        },
        'asmforge.paths.armasm': {
            type: 'string',
            default: 'armasm',
            description: 'Path to ARM Assembler executable',
        },
        'asmforge.paths.linker': {
            type: 'string',
            default: 'gcc',
            description: 'Path to linker executable',
        },
        'asmforge.paths.gdb': {
            type: 'string',
            default: 'gdb',
            description: 'Path to GDB executable',
        },
    },
};

export interface ToolchainPreferences {
    'asmforge.assembler.default': AssemblerType;
    'asmforge.assembler.architecture': ArchitectureTarget;
    'asmforge.assembler.outputFormat': OutputFormat;
    'asmforge.assembler.autoDetect': boolean;
    'asmforge.assembler.additionalFlags': string;
    'asmforge.assembler.includePaths': string[];
    'asmforge.linker.flags': string;
    'asmforge.build.generateListing': boolean;
    'asmforge.paths.nasm': string;
    'asmforge.paths.gas': string;
    'asmforge.paths.llvm': string;
    'asmforge.paths.armasm': string;
    'asmforge.paths.linker': string;
    'asmforge.paths.gdb': string;
}
