/**
 * GDB Debug Adapter - Debug Contribution
 * Integrates with Theia's debug framework
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    CommandRegistry,
    MessageService,
    QuickPickService,
    Command,
} from '@theia/core/lib/common';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import {
    DEFAULT_LAUNCH_CONFIGS,
    getAvailableConfigs,
    generateLaunchJson,
} from './debug-launch-configs';

export namespace DebugCommands {
    export const START_DEBUG: Command = {
        id: 'asmforge.debug.start',
        label: 'Start Debugging',
        category: 'Debug',
    };

    export const GENERATE_LAUNCH_JSON: Command = {
        id: 'asmforge.debug.generateLaunch',
        label: 'Generate launch.json',
        category: 'Debug',
    };

    export const DEBUG_QEMU: Command = {
        id: 'asmforge.debug.qemu',
        label: 'Debug with QEMU',
        category: 'Debug',
    };
}

@injectable()
export class DebugContribution implements CommandContribution {
    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @inject(WorkspaceService)
    protected readonly workspaceService!: WorkspaceService;

    @inject(FileService)
    protected readonly fileService!: FileService;

    @inject(QuickPickService)
    protected readonly quickPick!: QuickPickService;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(DebugCommands.START_DEBUG, {
            execute: () => this.startDebug(),
        });

        registry.registerCommand(DebugCommands.GENERATE_LAUNCH_JSON, {
            execute: () => this.generateLaunchJson(),
        });

        registry.registerCommand(DebugCommands.DEBUG_QEMU, {
            execute: () => this.debugWithQemu(),
        });
    }

    private async startDebug(): Promise<void> {
        // Get available configurations
        const configs = getAvailableConfigs();

        const items = configs.map((c) => ({
            label: c.label,
            description: c.description,
            id: c.name,
        }));

        const selected = await this.quickPick.show(items, {
            placeholder: 'Select debug configuration',
        });

        if (selected) {
            const config =
                DEFAULT_LAUNCH_CONFIGS[selected.id as keyof typeof DEFAULT_LAUNCH_CONFIGS];
            this.messageService.info(
                `Debug configuration selected: ${config.name}\nNote: Full debug integration requires GDB to be installed.`
            );
        }
    }

    private async generateLaunchJson(): Promise<void> {
        const workspace = this.workspaceService.tryGetRoots()[0];
        if (!workspace) {
            this.messageService.warn('No workspace folder open');
            return;
        }

        // Let user pick configurations
        const configs = getAvailableConfigs();
        const items = configs.map((c) => ({
            label: c.label,
            description: c.description,
            id: c.name,
        }));

        // Allow selection
        const selected = await this.quickPick.show(items, {
            placeholder: 'Select configurations to include',
        });

        if (!selected) return;

        // Include selected config
        const selectedConfigs = [selected.id];

        // Generate launch.json content
        const launchContent = generateLaunchJson(selectedConfigs);

        // Write to .vscode/launch.json
        const vscodePath = workspace.resource.resolve('.vscode');
        const launchPath = vscodePath.resolve('launch.json');

        try {
            // Create .vscode directory if needed
            try {
                await this.fileService.createFolder(vscodePath);
            } catch {
                // Directory might already exist
            }

            // Write file
            const content = JSON.stringify(launchContent, null, 4);
            await this.fileService.write(launchPath, content);

            this.messageService.info('Created .vscode/launch.json');
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.messageService.error(`Failed to create launch.json: ${message}`);
        }
    }

    private async debugWithQemu(): Promise<void> {
        // Quick start QEMU debugging
        const items = [
            { label: 'x86-64 Bare Metal', id: 'qemuBareMetal' },
            { label: 'ARM64', id: 'qemuArm' },
            { label: 'RISC-V 64', id: 'qemuRiscv' },
        ];

        const selected = await this.quickPick.show(items, {
            placeholder: 'Select QEMU target',
        });

        if (selected) {
            const config =
                DEFAULT_LAUNCH_CONFIGS[selected.id as keyof typeof DEFAULT_LAUNCH_CONFIGS];
            this.messageService.info(
                `QEMU debug configuration selected: ${config.name}\nNote: QEMU must be installed and running with -s -S flags.`
            );
        }
    }
}
