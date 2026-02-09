/**
 * Memory Viewer - Mock Data Generator
 * Generates realistic memory patterns for testing
 */

import {
    MemoryByte,
    MemoryRow,
    MemoryRegion,
    MemoryRegionInfo,
    StackFrameInfo,
} from '../common/memory-types';

/** Default memory regions for a typical x86-64 process */
export const DEFAULT_REGIONS: MemoryRegionInfo[] = [
    {
        name: '.text',
        startAddress: BigInt('0x555555554000'),
        endAddress: BigInt('0x555555560000'),
        region: 'code',
        permissions: { read: true, write: false, execute: true },
    },
    {
        name: '.data',
        startAddress: BigInt('0x555555560000'),
        endAddress: BigInt('0x555555565000'),
        region: 'data',
        permissions: { read: true, write: true, execute: false },
    },
    {
        name: '[heap]',
        startAddress: BigInt('0x555555580000'),
        endAddress: BigInt('0x5555555A0000'),
        region: 'heap',
        permissions: { read: true, write: true, execute: false },
    },
    {
        name: '[stack]',
        startAddress: BigInt('0x7FFFFFFDE000'),
        endAddress: BigInt('0x7FFFFFFFF000'),
        region: 'stack',
        permissions: { read: true, write: true, execute: false },
    },
];

/** Mock stack frame */
export const MOCK_STACK_FRAME: StackFrameInfo = {
    framePointer: BigInt('0x7FFFFFFFDE80'),
    stackPointer: BigInt('0x7FFFFFFFDE40'),
    returnAddress: BigInt('0x555555555142'),
    name: 'main',
};

/** Classify address into region */
export function classifyAddress(address: bigint): MemoryRegion {
    for (const region of DEFAULT_REGIONS) {
        if (address >= region.startAddress && address < region.endAddress) {
            return region.region;
        }
    }
    return 'unknown';
}

/** Generate random byte */
function randomByte(): number {
    return Math.floor(Math.random() * 256);
}

/** Generate realistic memory content based on region */
function generateRegionByte(address: bigint, region: MemoryRegion): number {
    switch (region) {
        case 'code':
            // x86 opcodes are varied but often have patterns
            const codePatterns = [
                0x48,
                0x89,
                0xe5, // mov rbp, rsp
                0x55, // push rbp
                0x5d, // pop rbp
                0xc3, // ret
                0x90, // nop
                0x0f,
                0x1f,
                0x00, // nop dword
                0x48,
                0x83,
                0xec, // sub rsp
                0x48,
                0x8b,
                0x45, // mov rax, [rbp+...]
            ];
            return codePatterns[Number(address % BigInt(codePatterns.length))];

        case 'stack':
            // Stack often has addresses and small values
            const stackPos = Number(address % BigInt(8));
            if (stackPos < 6) {
                // Address-like bytes
                return [0x7f, 0xff, 0xff, 0xff, 0xde, 0x80, randomByte(), randomByte()][stackPos];
            }
            return randomByte();

        case 'heap':
            // Heap has mixed data
            return randomByte();

        case 'data':
            // Data section often has strings and initialized values
            const printableChars = 'Hello, World! This is test data.\0';
            const idx = Number(address % BigInt(printableChars.length));
            return printableChars.charCodeAt(idx);

        default:
            return 0;
    }
}

/** Generate mock memory bytes */
export function generateMockMemory(startAddress: bigint, length: number): MemoryByte[] {
    const bytes: MemoryByte[] = [];

    for (let i = 0; i < length; i++) {
        const address = startAddress + BigInt(i);
        const region = classifyAddress(address);

        bytes.push({
            address,
            value: generateRegionByte(address, region),
            region,
            isModified: Math.random() < 0.02, // 2% modified
            isBreakpoint: Math.random() < 0.01, // 1% breakpoint
        });
    }

    return bytes;
}

/** Generate mock memory rows (16 bytes each) */
export function generateMockMemoryRows(startAddress: bigint, rowCount: number): MemoryRow[] {
    const rows: MemoryRow[] = [];

    // Align to 16-byte boundary
    const alignedStart = startAddress - (startAddress % BigInt(16));

    for (let r = 0; r < rowCount; r++) {
        const rowAddress = alignedStart + BigInt(r * 16);
        const bytes = generateMockMemory(rowAddress, 16);
        rows.push({ address: rowAddress, bytes });
    }

    return rows;
}

/** Simulate a memory write (for testing) */
export function simulateMemoryChange(rows: MemoryRow[]): MemoryRow[] {
    return rows.map((row) => ({
        ...row,
        bytes: row.bytes.map((b) => ({
            ...b,
            isModified: Math.random() < 0.05,
            value: Math.random() < 0.05 ? randomByte() : b.value,
        })),
    }));
}
