/**
 * Register Viewer - Architecture-specific Register Definitions
 */

import { Architecture, RegisterDefinition, RegisterGroup } from './register-types';

/** x86-64 register definitions */
export const X86_64_REGISTERS: RegisterDefinition[] = [
    // General purpose registers (64-bit)
    {
        name: 'RAX',
        size: 64,
        group: 'general',
        description: 'Accumulator',
        aliases: ['EAX', 'AX', 'AL'],
    },
    { name: 'RBX', size: 64, group: 'general', description: 'Base', aliases: ['EBX', 'BX', 'BL'] },
    {
        name: 'RCX',
        size: 64,
        group: 'general',
        description: 'Counter',
        aliases: ['ECX', 'CX', 'CL'],
    },
    { name: 'RDX', size: 64, group: 'general', description: 'Data', aliases: ['EDX', 'DX', 'DL'] },
    {
        name: 'RSI',
        size: 64,
        group: 'general',
        description: 'Source Index',
        aliases: ['ESI', 'SI', 'SIL'],
    },
    {
        name: 'RDI',
        size: 64,
        group: 'general',
        description: 'Destination Index',
        aliases: ['EDI', 'DI', 'DIL'],
    },
    {
        name: 'R8',
        size: 64,
        group: 'general',
        description: 'General Purpose R8',
        aliases: ['R8D', 'R8W', 'R8B'],
    },
    {
        name: 'R9',
        size: 64,
        group: 'general',
        description: 'General Purpose R9',
        aliases: ['R9D', 'R9W', 'R9B'],
    },
    {
        name: 'R10',
        size: 64,
        group: 'general',
        description: 'General Purpose R10',
        aliases: ['R10D', 'R10W', 'R10B'],
    },
    {
        name: 'R11',
        size: 64,
        group: 'general',
        description: 'General Purpose R11',
        aliases: ['R11D', 'R11W', 'R11B'],
    },
    {
        name: 'R12',
        size: 64,
        group: 'general',
        description: 'General Purpose R12',
        aliases: ['R12D', 'R12W', 'R12B'],
    },
    {
        name: 'R13',
        size: 64,
        group: 'general',
        description: 'General Purpose R13',
        aliases: ['R13D', 'R13W', 'R13B'],
    },
    {
        name: 'R14',
        size: 64,
        group: 'general',
        description: 'General Purpose R14',
        aliases: ['R14D', 'R14W', 'R14B'],
    },
    {
        name: 'R15',
        size: 64,
        group: 'general',
        description: 'General Purpose R15',
        aliases: ['R15D', 'R15W', 'R15B'],
    },

    // Special registers
    { name: 'RIP', size: 64, group: 'special', description: 'Instruction Pointer' },
    {
        name: 'RSP',
        size: 64,
        group: 'special',
        description: 'Stack Pointer',
        aliases: ['ESP', 'SP'],
    },
    {
        name: 'RBP',
        size: 64,
        group: 'special',
        description: 'Base Pointer',
        aliases: ['EBP', 'BP'],
    },
    {
        name: 'RFLAGS',
        size: 64,
        group: 'flags',
        description: 'Flags Register',
        aliases: ['EFLAGS', 'FLAGS'],
    },

    // SSE/AVX SIMD registers (showing XMM, expandable to YMM/ZMM)
    ...Array.from({ length: 16 }, (_, i) => ({
        name: `XMM${i}`,
        size: 128,
        group: 'simd' as RegisterGroup,
        description: `SSE Register ${i}`,
        aliases: [`YMM${i}`, `ZMM${i}`],
    })),
];

/** ARM64 (AArch64) register definitions */
export const ARM64_REGISTERS: RegisterDefinition[] = [
    // General purpose registers (64-bit)
    ...Array.from({ length: 29 }, (_, i) => ({
        name: `X${i}`,
        size: 64,
        group: 'general' as RegisterGroup,
        description: `General Purpose Register ${i}`,
        aliases: [`W${i}`], // 32-bit view
    })),
    {
        name: 'X29',
        size: 64,
        group: 'general',
        description: 'Frame Pointer (FP)',
        aliases: ['W29', 'FP'],
    },
    {
        name: 'X30',
        size: 64,
        group: 'general',
        description: 'Link Register (LR)',
        aliases: ['W30', 'LR'],
    },

    // Special registers
    { name: 'SP', size: 64, group: 'special', description: 'Stack Pointer', aliases: ['WSP'] },
    { name: 'PC', size: 64, group: 'special', description: 'Program Counter' },
    { name: 'PSTATE', size: 64, group: 'flags', description: 'Processor State (NZCV flags)' },

    // NEON SIMD registers (128-bit)
    ...Array.from({ length: 32 }, (_, i) => ({
        name: `V${i}`,
        size: 128,
        group: 'simd' as RegisterGroup,
        description: `NEON Vector Register ${i}`,
        aliases: [`Q${i}`, `D${i}`, `S${i}`, `H${i}`, `B${i}`],
    })),
];

/** RISC-V 64-bit register definitions */
export const RISCV64_REGISTERS: RegisterDefinition[] = [
    // Integer registers
    {
        name: 'x0',
        size: 64,
        group: 'general',
        description: 'Zero Register (always 0)',
        aliases: ['zero'],
    },
    { name: 'x1', size: 64, group: 'general', description: 'Return Address', aliases: ['ra'] },
    { name: 'x2', size: 64, group: 'special', description: 'Stack Pointer', aliases: ['sp'] },
    { name: 'x3', size: 64, group: 'special', description: 'Global Pointer', aliases: ['gp'] },
    { name: 'x4', size: 64, group: 'special', description: 'Thread Pointer', aliases: ['tp'] },
    { name: 'x5', size: 64, group: 'general', description: 'Temporary 0', aliases: ['t0'] },
    { name: 'x6', size: 64, group: 'general', description: 'Temporary 1', aliases: ['t1'] },
    { name: 'x7', size: 64, group: 'general', description: 'Temporary 2', aliases: ['t2'] },
    {
        name: 'x8',
        size: 64,
        group: 'special',
        description: 'Saved/Frame Pointer',
        aliases: ['s0', 'fp'],
    },
    { name: 'x9', size: 64, group: 'general', description: 'Saved 1', aliases: ['s1'] },
    {
        name: 'x10',
        size: 64,
        group: 'general',
        description: 'Argument 0 / Return',
        aliases: ['a0'],
    },
    {
        name: 'x11',
        size: 64,
        group: 'general',
        description: 'Argument 1 / Return',
        aliases: ['a1'],
    },
    { name: 'x12', size: 64, group: 'general', description: 'Argument 2', aliases: ['a2'] },
    { name: 'x13', size: 64, group: 'general', description: 'Argument 3', aliases: ['a3'] },
    { name: 'x14', size: 64, group: 'general', description: 'Argument 4', aliases: ['a4'] },
    { name: 'x15', size: 64, group: 'general', description: 'Argument 5', aliases: ['a5'] },
    { name: 'x16', size: 64, group: 'general', description: 'Argument 6', aliases: ['a6'] },
    { name: 'x17', size: 64, group: 'general', description: 'Argument 7', aliases: ['a7'] },
    { name: 'x18', size: 64, group: 'general', description: 'Saved 2', aliases: ['s2'] },
    { name: 'x19', size: 64, group: 'general', description: 'Saved 3', aliases: ['s3'] },
    { name: 'x20', size: 64, group: 'general', description: 'Saved 4', aliases: ['s4'] },
    { name: 'x21', size: 64, group: 'general', description: 'Saved 5', aliases: ['s5'] },
    { name: 'x22', size: 64, group: 'general', description: 'Saved 6', aliases: ['s6'] },
    { name: 'x23', size: 64, group: 'general', description: 'Saved 7', aliases: ['s7'] },
    { name: 'x24', size: 64, group: 'general', description: 'Saved 8', aliases: ['s8'] },
    { name: 'x25', size: 64, group: 'general', description: 'Saved 9', aliases: ['s9'] },
    { name: 'x26', size: 64, group: 'general', description: 'Saved 10', aliases: ['s10'] },
    { name: 'x27', size: 64, group: 'general', description: 'Saved 11', aliases: ['s11'] },
    { name: 'x28', size: 64, group: 'general', description: 'Temporary 3', aliases: ['t3'] },
    { name: 'x29', size: 64, group: 'general', description: 'Temporary 4', aliases: ['t4'] },
    { name: 'x30', size: 64, group: 'general', description: 'Temporary 5', aliases: ['t5'] },
    { name: 'x31', size: 64, group: 'general', description: 'Temporary 6', aliases: ['t6'] },

    // Program counter
    { name: 'pc', size: 64, group: 'special', description: 'Program Counter' },

    // Floating-point registers (F extension)
    ...Array.from({ length: 32 }, (_, i) => ({
        name: `f${i}`,
        size: 64,
        group: 'float' as RegisterGroup,
        description: `Floating-point Register ${i}`,
        aliases: [`ft${i <= 7 ? i : ''}`].filter((a) => a),
    })),
];

/** Get register definitions for an architecture */
export function getArchitectureRegisters(arch: Architecture): RegisterDefinition[] {
    switch (arch) {
        case 'x86-64':
            return X86_64_REGISTERS;
        case 'arm64':
            return ARM64_REGISTERS;
        case 'riscv64':
            return RISCV64_REGISTERS;
        default:
            return X86_64_REGISTERS;
    }
}

/** Get human-readable name for architecture */
export function getArchitectureName(arch: Architecture): string {
    switch (arch) {
        case 'x86-64':
            return 'x86-64 (AMD64)';
        case 'arm64':
            return 'ARM64 (AArch64)';
        case 'riscv64':
            return 'RISC-V 64-bit';
        default:
            return arch;
    }
}

/** Get human-readable name for register group */
export function getGroupName(group: RegisterGroup): string {
    switch (group) {
        case 'general':
            return 'General Purpose';
        case 'special':
            return 'Special';
        case 'simd':
            return 'SIMD / Vector';
        case 'flags':
            return 'Flags';
        case 'float':
            return 'Floating Point';
        default:
            return group;
    }
}
