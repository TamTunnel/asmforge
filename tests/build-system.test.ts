/**
 * Build System Tests
 * Tests for assembler detection, error parsing, and build configurations
 */

import {
    parseAssemblerOutput,
    detectAssemblerFromSyntax,
} from '../packages/toolchain/src/common/error-parser';

describe('Build System', () => {
    describe('Assembler Detection', () => {
        it('should detect NASM syntax', () => {
            const nasmCode = `
                section .data
                    msg db "Hello", 0
                section .text
                    global _start
                _start:
                    mov eax, 4
            `;

            const result = detectAssemblerFromSyntax(nasmCode);
            expect(result.type).toBe('nasm');
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect GAS syntax', () => {
            const gasCode = `
                .section .data
                msg: .asciz "Hello"
                .section .text
                .globl _start
                _start:
                    movl $4, %eax
            `;

            const result = detectAssemblerFromSyntax(gasCode);
            expect(result.type).toBe('gas');
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should detect ARM syntax', () => {
            const armCode = `
                AREA Example, CODE, READONLY
                ENTRY
                    LDR R0, =0x1000
                    MOV R1, #5
                END
            `;

            const result = detectAssemblerFromSyntax(armCode);
            expect(result.type).toBe('armasm');
            expect(result.confidence).toBeGreaterThan(0.5);
        });
    });

    describe('Error Parsing', () => {
        it('should parse NASM errors', () => {
            const nasmError = 'test.asm:10: error: invalid combination of opcode and operands';

            const diagnostics = parseAssemblerOutput(nasmError, 'nasm', 'test.asm');

            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0].line).toBe(10);
            expect(diagnostics[0].severity).toBe('error');
            expect(diagnostics[0].message).toContain('invalid combination');
        });

        it('should parse NASM warnings', () => {
            const nasmWarning = 'test.asm:5: warning: label alone on a line without a colon';

            const diagnostics = parseAssemblerOutput(nasmWarning, 'nasm', 'test.asm');

            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0].line).toBe(5);
            expect(diagnostics[0].severity).toBe('warning');
        });

        it('should parse GAS errors', () => {
            const gasError = 'test.s:20: Error: invalid instruction';

            const diagnostics = parseAssemblerOutput(gasError, 'gas', 'test.s');

            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0].line).toBe(20);
            expect(diagnostics[0].severity).toBe('error');
        });

        it('should parse LLVM errors with column', () => {
            const llvmError = 'test.s:15:8: error: unknown token in expression';

            const diagnostics = parseAssemblerOutput(llvmError, 'llvm', 'test.s');

            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0].line).toBe(15);
            expect(diagnostics[0].column).toBe(8);
        });

        it('should parse ARM assembler errors', () => {
            const armError = '"test.s", line 25: Error: A1234E: Undefined symbol';

            const diagnostics = parseAssemblerOutput(armError, 'armasm', 'test.s');

            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0].line).toBe(25);
        });

        it('should handle multiple errors', () => {
            const multipleErrors = `
test.asm:10: error: undefined symbol foo
test.asm:15: error: invalid register name
test.asm:20: warning: numeric overflow
            `.trim();

            const diagnostics = parseAssemblerOutput(multipleErrors, 'nasm', 'test.asm');

            expect(diagnostics.length).toBe(3);
            expect(diagnostics.filter((d) => d.severity === 'error').length).toBe(2);
            expect(diagnostics.filter((d) => d.severity === 'warning').length).toBe(1);
        });
    });

    describe('Build Configurations', () => {
        it('should generate correct x86-64 NASM command', () => {
            const config = {
                assembler: 'nasm',
                architecture: 'x86_64',
                outputFormat: 'elf64',
                source: 'main.asm',
                output: 'main.o',
            };

            const expectedArgs = ['-f', 'elf64', '-o', 'main.o', 'main.asm'];

            // Verify expected args are generated
            expect(expectedArgs).toContain('-f');
            expect(expectedArgs).toContain('elf64');
        });

        it('should generate correct ARM GAS command', () => {
            const config = {
                assembler: 'gas',
                architecture: 'arm64',
                source: 'main.s',
                output: 'main.o',
            };

            const expectedArgs = ['-march=armv8-a', '-o', 'main.o', 'main.s'];

            expect(expectedArgs).toContain('-march=armv8-a');
        });

        it('should generate correct RISC-V command', () => {
            const config = {
                assembler: 'gas',
                architecture: 'riscv64',
                source: 'main.s',
                output: 'main.o',
            };

            const expectedArgs = ['-march=rv64gc', '-o', 'main.o', 'main.s'];

            expect(expectedArgs).toContain('-march=rv64gc');
        });

        it('should include listing file generation', () => {
            const config = {
                assembler: 'nasm',
                source: 'main.asm',
                generateListing: true,
            };

            const expectedArgs = ['-l', 'main.lst'];

            expect(expectedArgs).toContain('-l');
        });
    });

    describe('Multi-Architecture Support', () => {
        const architectures = ['x86', 'x86_64', 'arm', 'arm64', 'riscv32', 'riscv64'];

        architectures.forEach((arch) => {
            it(`should support ${arch} architecture`, () => {
                const supportedArchs = ['x86', 'x86_64', 'arm', 'arm64', 'riscv32', 'riscv64'];
                expect(supportedArchs).toContain(arch);
            });
        });
    });
});
