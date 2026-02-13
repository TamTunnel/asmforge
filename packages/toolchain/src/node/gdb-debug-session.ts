/**
 * GDB Debug Adapter - Debug Adapter Session
 * Implements the Debug Adapter Protocol for GDB
 */

import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common';
import { spawn, ChildProcess } from 'child_process';
import { parseGdbMiOutput } from '../common/gdb-mi-parser';
import {
    GdbLaunchConfig,
    GdbStackFrame,
    GdbRegisterValue,
    GdbMemoryRead,
    GdbBreakpoint,
    StopEventData,
} from '../common/gdb-types';

export const GdbDebugSession = Symbol('GdbDebugSession');

export interface GdbDebugSession {
    /** Start debug session */
    start(config: GdbLaunchConfig): Promise<void>;

    /** Stop debug session */
    stop(): Promise<void>;

    /** Continue execution */
    continue(): Promise<void>;

    /** Step into */
    stepIn(): Promise<void>;

    /** Step over */
    stepOver(): Promise<void>;

    /** Step out */
    stepOut(): Promise<void>;

    /** Set breakpoint */
    setBreakpoint(file: string, line: number): Promise<GdbBreakpoint | undefined>;

    /** Remove breakpoint */
    removeBreakpoint(id: string): Promise<void>;

    /** Get stack frames */
    getStackFrames(): Promise<GdbStackFrame[]>;

    /** Get registers */
    getRegisters(): Promise<GdbRegisterValue[]>;

    /** Read memory */
    readMemory(address: string, length: number): Promise<GdbMemoryRead>;

    /** On stopped event */
    readonly onStopped: Event<StopEventData>;

    /** On running event */
    readonly onRunning: Event<void>;

    /** On exited event */
    readonly onExited: Event<{ code: number }>;

    /** On output event */
    readonly onOutput: Event<string>;

    /** Is session active */
    readonly isActive: boolean;
}

@injectable()
export class GdbDebugSessionImpl implements GdbDebugSession {
    private gdbProcess: ChildProcess | undefined;
    private tokenCounter = 1;
    private pendingCommands = new Map<
        number,
        { resolve: (value: any) => void; reject: (error: any) => void }
    >();
    private _isActive = false;

    private readonly onStoppedEmitter = new Emitter<StopEventData>();
    readonly onStopped = this.onStoppedEmitter.event;

    private readonly onRunningEmitter = new Emitter<void>();
    readonly onRunning = this.onRunningEmitter.event;

    private readonly onExitedEmitter = new Emitter<{ code: number }>();
    readonly onExited = this.onExitedEmitter.event;

    private readonly onOutputEmitter = new Emitter<string>();
    readonly onOutput = this.onOutputEmitter.event;

    get isActive(): boolean {
        return this._isActive;
    }

    async start(config: GdbLaunchConfig): Promise<void> {
        const gdbPath = config.gdbPath || 'gdb';
        const args = ['-i=mi', ...(config.gdbArgs || [])];

        this.gdbProcess = spawn(gdbPath, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: config.cwd,
        });

        this._isActive = true;

        // Handle stdout
        let buffer = '';
        this.gdbProcess.stdout?.on('data', (data: Buffer) => {
            buffer += data.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                this.handleGdbOutput(line);
            }
        });

        // Handle stderr
        this.gdbProcess.stderr?.on('data', (data: Buffer) => {
            this.onOutputEmitter.fire(`[GDB Error] ${data.toString()}`);
        });

        // Handle exit
        this.gdbProcess.on('close', (code) => {
            this._isActive = false;
            this.onExitedEmitter.fire({ code: code ?? 0 });
        });

        // Wait for GDB to be ready
        await this.waitForPrompt();

        // Setup commands
        for (const cmd of config.setupCommands || []) {
            await this.sendCommand(cmd);
        }

        // Load program or attach
        if (config.request === 'launch' && config.program) {
            // Quote the program path to handle paths with spaces
            const escapedProgram = config.program.replace(/"/g, '\\"');
            await this.sendCommand(`file "${escapedProgram}"`);

            // Set args if provided
            if (config.args && config.args.length > 0) {
                const escapedArgs = config.args.map((a) =>
                    a.includes(' ') ? `"${a.replace(/"/g, '\\"')}"` : a
                );
                await this.sendCommand(`set args ${escapedArgs.join(' ')}`);
            }

            // Run
            await this.sendMiCommand('exec-run');
        } else if (config.request === 'attach' && config.processId) {
            await this.sendMiCommand(`target-attach ${config.processId}`);
        } else if (config.remote) {
            await this.sendCommand(`target remote ${config.remote.host}:${config.remote.port}`);
        } else if (config.qemu) {
            // QEMU debugging: start QEMU externally and connect
            await this.sendCommand('target remote localhost:1234');
        }

        // Post-load commands
        for (const cmd of config.postLoadCommands || []) {
            await this.sendCommand(cmd);
        }
    }

    async stop(): Promise<void> {
        if (this.gdbProcess) {
            await this.sendMiCommand('gdb-exit');
            this.gdbProcess.kill();
            this.gdbProcess = undefined;
        }
        this._isActive = false;
    }

    async continue(): Promise<void> {
        await this.sendMiCommand('exec-continue');
    }

    async stepIn(): Promise<void> {
        await this.sendMiCommand('exec-step');
    }

    async stepOver(): Promise<void> {
        await this.sendMiCommand('exec-next');
    }

    async stepOut(): Promise<void> {
        await this.sendMiCommand('exec-finish');
    }

    async setBreakpoint(file: string, line: number): Promise<GdbBreakpoint | undefined> {
        const result = await this.sendMiCommand(`break-insert ${file}:${line}`);
        if (result.class === 'done' && result.data.bkpt) {
            const bkpt = result.data.bkpt;
            return {
                number: bkpt.number,
                type: bkpt.type || 'breakpoint',
                address: bkpt.addr || '',
                file: bkpt.file,
                line: bkpt.line ? parseInt(bkpt.line, 10) : undefined,
                enabled: bkpt.enabled === 'y',
                times: bkpt.times ? parseInt(bkpt.times, 10) : 0,
            };
        }
        return undefined;
    }

    async removeBreakpoint(id: string): Promise<void> {
        await this.sendMiCommand(`break-delete ${id}`);
    }

    async getStackFrames(): Promise<GdbStackFrame[]> {
        const result = await this.sendMiCommand('stack-list-frames');
        if (result.class === 'done' && result.data.stack) {
            return result.data.stack.map((frame: any) => ({
                level: parseInt(frame.level, 10),
                address: frame.addr || '',
                func: frame.func,
                file: frame.file,
                line: frame.line ? parseInt(frame.line, 10) : undefined,
                fullname: frame.fullname,
            }));
        }
        return [];
    }

    async getRegisters(): Promise<GdbRegisterValue[]> {
        const result = await this.sendMiCommand('data-list-register-values x');
        if (result.class === 'done' && result.data['register-values']) {
            return result.data['register-values'].map((rv: any) => ({
                number: rv.number,
                value: rv.value,
            }));
        }
        return [];
    }

    async readMemory(address: string, length: number): Promise<GdbMemoryRead> {
        const result = await this.sendMiCommand(`data-read-memory-bytes ${address} ${length}`);
        if (result.class === 'done' && result.data.memory) {
            const mem = result.data.memory[0];
            return {
                address: mem.begin || address,
                contents: mem.contents || '',
            };
        }
        return { address, contents: '', error: 'Failed to read memory' };
    }

    private async waitForPrompt(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    private async sendCommand(command: string): Promise<void> {
        if (!this.gdbProcess?.stdin?.writable) return;

        return new Promise((resolve, reject) => {
            this.gdbProcess!.stdin!.write(command + '\n', (err) => {
                if (err) reject(err);
                else {
                    setTimeout(resolve, 100);
                }
            });
        });
    }

    private async sendMiCommand(command: string): Promise<any> {
        if (!this.gdbProcess?.stdin?.writable) {
            return { class: 'error', data: { msg: 'GDB not running' }, raw: '' };
        }

        const token = this.tokenCounter++;
        const fullCommand = `${token}-${command}`;

        return new Promise((resolve, reject) => {
            this.pendingCommands.set(token, { resolve, reject });

            this.gdbProcess!.stdin!.write(fullCommand + '\n', (err) => {
                if (err) {
                    this.pendingCommands.delete(token);
                    reject(err);
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (this.pendingCommands.has(token)) {
                    this.pendingCommands.delete(token);
                    resolve({ class: 'error', data: { msg: 'Timeout' }, raw: '' });
                }
            }, 10000);
        });
    }

    private handleGdbOutput(line: string): void {
        const parsed = parseGdbMiOutput(line);
        if (!parsed) return;

        // Emit console output
        if (parsed.type === 'console') {
            this.onOutputEmitter.fire(parsed.data.text || '');
            return;
        }

        // Handle result records (responses to commands)
        if (parsed.type === 'result' && parsed.token !== undefined) {
            const pending = this.pendingCommands.get(parsed.token);
            if (pending) {
                this.pendingCommands.delete(parsed.token);
                pending.resolve(parsed);
            }
            return;
        }

        // Handle async exec records (state changes)
        if (parsed.type === 'exec') {
            this.handleExecRecord(parsed);
            return;
        }

        // Log other output
        this.onOutputEmitter.fire(`[GDB] ${line}`);
    }

    private handleExecRecord(parsed: any): void {
        const reason = parsed.data.reason || '';

        switch (parsed.class) {
            case 'stopped':
                this.onStoppedEmitter.fire({
                    reason,
                    threadId: parsed.data['thread-id'] ? parseInt(parsed.data['thread-id'], 10) : 1,
                    frame: parsed.data.frame
                        ? {
                              level: 0,
                              address: parsed.data.frame.addr || '',
                              func: parsed.data.frame.func,
                              file: parsed.data.frame.file,
                              line: parsed.data.frame.line
                                  ? parseInt(parsed.data.frame.line, 10)
                                  : undefined,
                              fullname: parsed.data.frame.fullname,
                          }
                        : undefined,
                    breakpointId: parsed.data.bkptno,
                });
                break;

            case 'running':
                this.onRunningEmitter.fire();
                break;
        }
    }
}
