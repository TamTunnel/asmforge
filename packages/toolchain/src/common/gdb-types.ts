/**
 * GDB Debug Adapter - Types
 */

/** GDB MI response types */
export type GdbMiRecordType =
    | 'result'
    | 'exec'
    | 'status'
    | 'notify'
    | 'console'
    | 'target'
    | 'log';

/** GDB MI parsed result */
export interface GdbMiResult {
    type: GdbMiRecordType;
    class: string;
    token?: number;
    data: Record<string, any>;
    raw: string;
}

/** Register value from GDB */
export interface GdbRegisterValue {
    number: string;
    value: string;
}

/** Memory read result */
export interface GdbMemoryRead {
    address: string;
    contents: string;
    error?: string;
}

/** Stack frame from GDB */
export interface GdbStackFrame {
    level: number;
    address: string;
    func?: string;
    file?: string;
    line?: number;
    fullname?: string;
}

/** Breakpoint info */
export interface GdbBreakpoint {
    number: string;
    type: string;
    address: string;
    file?: string;
    line?: number;
    enabled: boolean;
    times: number;
}

/** Launch configuration for GDB */
export interface GdbLaunchConfig {
    type: 'gdb';
    request: 'launch' | 'attach';
    name: string;

    // Launch options
    program?: string;
    args?: string[];
    cwd?: string;

    // Attach options
    processId?: number;

    // Remote debug
    remote?: {
        host: string;
        port: number;
    };

    // QEMU options
    qemu?: {
        machine: string;
        cpu?: string;
        kernel: string;
        additionalArgs?: string[];
    };

    // GDB settings
    gdbPath?: string;
    gdbArgs?: string[];

    // Architecture
    architecture?: 'x86' | 'x86_64' | 'arm' | 'arm64' | 'riscv32' | 'riscv64';

    // Pre/post commands
    setupCommands?: string[];
    postLoadCommands?: string[];
}

/** Debug event types */
export type DebugEventType =
    | 'stopped'
    | 'running'
    | 'breakpoint-hit'
    | 'end-stepping-range'
    | 'exited'
    | 'exited-normally';

/** Stop event data */
export interface StopEventData {
    reason: string;
    threadId: number;
    frame?: GdbStackFrame;
    breakpointId?: string;
}
