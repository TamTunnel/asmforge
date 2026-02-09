/**
 * GDB Debug Adapter - Debug Configuration Provider
 * Provides launch.json templates
 */

export const GDB_DEBUG_TYPE = 'asmforge-gdb';

/** Default launch configurations for common scenarios */
export const DEFAULT_LAUNCH_CONFIGS = {
    /** Debug a Linux userspace program */
    linuxUserspace: {
        type: GDB_DEBUG_TYPE,
        request: 'launch',
        name: 'Debug Assembly (Linux)',
        program: '${workspaceFolder}/${fileBasenameNoExtension}',
        cwd: '${workspaceFolder}',
        architecture: 'x86_64',
        setupCommands: ['set disassembly-flavor intel'],
    },

    /** Debug with QEMU (bare metal) */
    qemuBareMetal: {
        type: GDB_DEBUG_TYPE,
        request: 'launch',
        name: 'Debug Bare Metal (QEMU)',
        qemu: {
            machine: 'pc',
            kernel: '${workspaceFolder}/${fileBasenameNoExtension}.bin',
        },
        remote: {
            host: 'localhost',
            port: 1234,
        },
        architecture: 'x86_64',
        setupCommands: ['set disassembly-flavor intel', 'set architecture i386:x86-64'],
        postLoadCommands: ['break *0x7c00'],
    },

    /** Attach to running process */
    attachProcess: {
        type: GDB_DEBUG_TYPE,
        request: 'attach',
        name: 'Attach to Process',
        processId: '${command:pickProcess}',
        architecture: 'x86_64',
    },

    /** Remote debugging (embedded/other machine) */
    remoteDebug: {
        type: GDB_DEBUG_TYPE,
        request: 'launch',
        name: 'Remote Debug',
        program: '${workspaceFolder}/${fileBasenameNoExtension}',
        remote: {
            host: 'localhost',
            port: 3333,
        },
        architecture: 'arm64',
        setupCommands: ['monitor reset halt'],
    },

    /** Debug ARM bare metal with QEMU */
    qemuArm: {
        type: GDB_DEBUG_TYPE,
        request: 'launch',
        name: 'Debug ARM Bare Metal (QEMU)',
        qemu: {
            machine: 'virt',
            cpu: 'cortex-a53',
            kernel: '${workspaceFolder}/${fileBasenameNoExtension}.bin',
        },
        remote: {
            host: 'localhost',
            port: 1234,
        },
        architecture: 'arm64',
        gdbPath: 'aarch64-linux-gnu-gdb',
    },

    /** Debug RISC-V with QEMU */
    qemuRiscv: {
        type: GDB_DEBUG_TYPE,
        request: 'launch',
        name: 'Debug RISC-V (QEMU)',
        qemu: {
            machine: 'virt',
            kernel: '${workspaceFolder}/${fileBasenameNoExtension}.bin',
        },
        remote: {
            host: 'localhost',
            port: 1234,
        },
        architecture: 'riscv64',
        gdbPath: 'riscv64-linux-gnu-gdb',
    },
};

/** Generate a launch.json file content */
export function generateLaunchJson(configs: string[]): object {
    const selectedConfigs = configs.map((name) => {
        const config = DEFAULT_LAUNCH_CONFIGS[name as keyof typeof DEFAULT_LAUNCH_CONFIGS];
        return config || DEFAULT_LAUNCH_CONFIGS.linuxUserspace;
    });

    return {
        version: '0.2.0',
        configurations: selectedConfigs,
    };
}

/** Get available launch configuration names */
export function getAvailableConfigs(): { name: string; label: string; description: string }[] {
    return [
        {
            name: 'linuxUserspace',
            label: 'Linux Userspace',
            description: 'Debug a native Linux assembly program',
        },
        {
            name: 'qemuBareMetal',
            label: 'QEMU Bare Metal (x86)',
            description: 'Debug bare metal x86 code with QEMU',
        },
        {
            name: 'attachProcess',
            label: 'Attach to Process',
            description: 'Attach debugger to a running process',
        },
        {
            name: 'remoteDebug',
            label: 'Remote Debug',
            description: 'Connect to a remote GDB server',
        },
        {
            name: 'qemuArm',
            label: 'QEMU ARM64',
            description: 'Debug ARM64 code with QEMU',
        },
        {
            name: 'qemuRiscv',
            label: 'QEMU RISC-V',
            description: 'Debug RISC-V code with QEMU',
        },
    ];
}
