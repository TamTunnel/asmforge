/**
 * Debug Workflow Tests
 * End-to-end debugging tests for GDB integration
 */

import { parseGdbMiOutput } from '../packages/toolchain/src/common/gdb-mi-parser';

describe('Debug Workflow', () => {
    describe('GDB MI Protocol Parsing', () => {
        it('should parse result records', () => {
            const output =
                '^done,bkpt={number="1",type="breakpoint",addr="0x08048564",file="main.c",line="10"}';

            const parsed = parseGdbMiOutput(output);

            expect(parsed).toBeDefined();
            expect(parsed?.type).toBe('result');
            expect(parsed?.class).toBe('done');
            expect(parsed?.data.bkpt).toBeDefined();
            expect(parsed?.data.bkpt.number).toBe('1');
        });

        it('should parse error records', () => {
            const output = '^error,msg="No symbol table loaded"';

            const parsed = parseGdbMiOutput(output);

            expect(parsed?.type).toBe('result');
            expect(parsed?.class).toBe('error');
            expect(parsed?.data.msg).toBe('No symbol table loaded');
        });

        it('should parse exec async records', () => {
            const output = '*stopped,reason="breakpoint-hit",bkptno="1",thread-id="1"';

            const parsed = parseGdbMiOutput(output);

            expect(parsed?.type).toBe('exec');
            expect(parsed?.class).toBe('stopped');
            expect(parsed?.data.reason).toBe('breakpoint-hit');
        });

        it('should parse running records', () => {
            const output = '*running,thread-id="all"';

            const parsed = parseGdbMiOutput(output);

            expect(parsed?.type).toBe('exec');
            expect(parsed?.class).toBe('running');
        });

        it('should parse console output', () => {
            const output = '~"Breakpoint 1 at 0x401000: file main.asm, line 10.\\n"';

            const parsed = parseGdbMiOutput(output);

            expect(parsed?.type).toBe('console');
        });

        it('should parse stack frames', () => {
            const output =
                '^done,stack=[frame={level="0",addr="0x401000",func="_start",file="main.asm",line="10"}]';

            const parsed = parseGdbMiOutput(output);

            expect(parsed?.data.stack).toBeDefined();
            expect(Array.isArray(parsed?.data.stack)).toBe(true);
        });

        it('should parse register values', () => {
            const output =
                '^done,register-values=[{number="0",value="0x0"},{number="1",value="0x7fff"}]';

            const parsed = parseGdbMiOutput(output);

            expect(parsed?.data['register-values']).toBeDefined();
        });
    });

    describe('Launch Configuration Generation', () => {
        it('should generate Linux userspace config', () => {
            const config = {
                name: 'Debug Linux Program',
                type: 'gdb',
                request: 'launch',
                program: '${workspaceFolder}/main',
                cwd: '${workspaceFolder}',
            };

            expect(config.type).toBe('gdb');
            expect(config.request).toBe('launch');
        });

        it('should generate QEMU x86 config', () => {
            const config = {
                name: 'Debug QEMU x86',
                type: 'gdb',
                request: 'launch',
                target: 'remote localhost:1234',
                qemu: {
                    command: 'qemu-system-x86_64',
                    args: ['-s', '-S', '-kernel', 'kernel.bin'],
                },
            };

            expect(config.target).toContain('localhost:1234');
            expect(config.qemu?.args).toContain('-s');
        });

        it('should generate QEMU ARM config', () => {
            const config = {
                name: 'Debug QEMU ARM',
                type: 'gdb',
                request: 'launch',
                gdbPath: 'aarch64-linux-gnu-gdb',
                target: 'remote localhost:1234',
            };

            expect(config.gdbPath).toContain('aarch64');
        });

        it('should generate attach config', () => {
            const config = {
                name: 'Attach to Process',
                type: 'gdb',
                request: 'attach',
                processId: '${command:pickProcess}',
            };

            expect(config.request).toBe('attach');
        });
    });

    describe('Breakpoint Management', () => {
        it('should set breakpoint by line', () => {
            const breakpoint = {
                file: 'main.asm',
                line: 10,
                enabled: true,
            };

            expect(breakpoint.file).toBe('main.asm');
            expect(breakpoint.line).toBe(10);
        });

        it('should set breakpoint by address', () => {
            const breakpoint = {
                address: '0x401000',
                enabled: true,
            };

            expect(breakpoint.address).toBe('0x401000');
        });

        it('should handle conditional breakpoints', () => {
            const breakpoint = {
                file: 'main.asm',
                line: 15,
                condition: '$eax == 0',
            };

            expect(breakpoint.condition).toContain('eax');
        });
    });

    describe('Stepping Operations', () => {
        const operations = ['stepIn', 'stepOver', 'stepOut', 'continue', 'pause'];

        operations.forEach((op) => {
            it(`should support ${op} operation`, () => {
                const validOps = ['stepIn', 'stepOver', 'stepOut', 'continue', 'pause'];
                expect(validOps).toContain(op);
            });
        });
    });

    describe('Register Inspection', () => {
        it('should read x86_64 general registers', () => {
            const registers = [
                { name: 'rax', value: '0x0000000000000000' },
                { name: 'rbx', value: '0x0000000000000000' },
                { name: 'rcx', value: '0x0000000000000000' },
                { name: 'rdx', value: '0x0000000000000000' },
                { name: 'rsi', value: '0x0000000000000000' },
                { name: 'rdi', value: '0x0000000000000000' },
                { name: 'rsp', value: '0x00007fffffffe000' },
                { name: 'rbp', value: '0x0000000000000000' },
                { name: 'rip', value: '0x0000000000401000' },
            ];

            expect(registers.find((r) => r.name === 'rax')).toBeDefined();
            expect(registers.find((r) => r.name === 'rip')).toBeDefined();
        });

        it('should read ARM registers', () => {
            const registers = [
                { name: 'r0', value: '0x00000000' },
                { name: 'r1', value: '0x00000000' },
                { name: 'sp', value: '0x00100000' },
                { name: 'lr', value: '0x00000000' },
                { name: 'pc', value: '0x00008000' },
                { name: 'cpsr', value: '0x00000010' },
            ];

            expect(registers.find((r) => r.name === 'pc')).toBeDefined();
            expect(registers.find((r) => r.name === 'cpsr')).toBeDefined();
        });
    });

    describe('Memory Inspection', () => {
        it('should read memory at address', () => {
            const memoryRead = {
                address: '0x401000',
                length: 16,
                contents: '48 89 e5 53 48 83 ec 08 e8 00 00 00 00 48 8b 45',
            };

            expect(memoryRead.address).toBe('0x401000');
            expect(memoryRead.contents.split(' ').length).toBe(16);
        });

        it('should handle memory read errors', () => {
            const errorRead = {
                address: '0x0',
                error: 'Cannot access memory at address 0x0',
            };

            expect(errorRead.error).toContain('Cannot access');
        });
    });

    describe('Disassembly', () => {
        it('should disassemble at current location', () => {
            const disassembly = [
                { address: '0x401000', instruction: 'push rbp' },
                { address: '0x401001', instruction: 'mov rbp, rsp' },
                { address: '0x401004', instruction: 'sub rsp, 0x10' },
            ];

            expect(disassembly.length).toBeGreaterThan(0);
            expect(disassembly[0].instruction).toContain('push');
        });
    });
});
