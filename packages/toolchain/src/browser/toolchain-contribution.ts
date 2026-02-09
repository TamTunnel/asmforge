/**
 * Toolchain - Frontend Contribution
 * Registers commands, menus, and keybindings
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import {
    CommandContribution,
    CommandRegistry,
    MenuContribution,
    MenuModelRegistry,
    MessageService,
    QuickPickService,
    QuickPickItem,
} from '@theia/core/lib/common';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser';
import { EditorManager } from '@theia/editor/lib/browser';
import { OutputChannelManager, OutputChannel } from '@theia/output/lib/browser/output-channel';
import { ToolchainCommands } from './toolchain-commands';
import { ToolchainDiagnosticProvider } from './toolchain-diagnostic-provider';
import {
    AssemblerType,
    DEFAULT_ASSEMBLER_CONFIGS,
    BuildConfig,
    AssemblerConfig,
    ArchitectureTarget,
    OutputFormat,
} from '../common/toolchain-types';
import { detectAssemblerFromSyntax } from '../common/error-parser';

export const AssemblerServiceClient = Symbol('AssemblerServiceClient');

/** Client-side interface for calling backend assembler service */
export interface AssemblerServiceClient {
    checkAssembler(type: AssemblerType): Promise<{ available: boolean; version?: string }>;
    assemble(
        config: BuildConfig
    ): Promise<{
        success: boolean;
        exitCode: number;
        diagnostics: any[];
        stdout: string;
        stderr: string;
        duration: number;
        outputFile?: string;
        listingFile?: string;
    }>;
    link(objectFiles: string[], outputFile: string, flags: string[]): Promise<any>;
}

@injectable()
export class ToolchainContribution
    implements CommandContribution, MenuContribution, KeybindingContribution
{
    private outputChannel: OutputChannel | undefined;
    private preferences: Map<string, any> = new Map();

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @inject(EditorManager)
    protected readonly editorManager!: EditorManager;

    @inject(OutputChannelManager)
    protected readonly outputChannelManager!: OutputChannelManager;

    @inject(ToolchainDiagnosticProvider)
    protected readonly diagnosticProvider!: ToolchainDiagnosticProvider;

    @inject(QuickPickService)
    protected readonly quickPick!: QuickPickService;

    @inject(AssemblerServiceClient)
    protected readonly assemblerService!: AssemblerServiceClient;

    // Use local preferences store for now
    private getPreference<T>(key: string, defaultValue: T): T {
        return this.preferences.has(key) ? this.preferences.get(key) : defaultValue;
    }

    private setPreference(key: string, value: any): void {
        this.preferences.set(key, value);
    }

    private getOutputChannel(): OutputChannel {
        if (!this.outputChannel) {
            this.outputChannel = this.outputChannelManager.getChannel('AsmForge Build');
        }
        return this.outputChannel;
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(ToolchainCommands.ASSEMBLE_FILE, {
            execute: () => this.assembleCurrentFile(false),
            isEnabled: () => this.hasAssemblyFileOpen(),
        });

        registry.registerCommand(ToolchainCommands.ASSEMBLE_AND_LINK, {
            execute: () => this.assembleCurrentFile(true),
            isEnabled: () => this.hasAssemblyFileOpen(),
        });

        registry.registerCommand(ToolchainCommands.GENERATE_LISTING, {
            execute: () => this.generateListing(),
            isEnabled: () => this.hasAssemblyFileOpen(),
        });

        registry.registerCommand(ToolchainCommands.SET_ASSEMBLER, {
            execute: () => this.setDefaultAssembler(),
        });

        registry.registerCommand(ToolchainCommands.DETECT_ASSEMBLER, {
            execute: () => this.detectAssembler(),
            isEnabled: () => this.hasAssemblyFileOpen(),
        });

        registry.registerCommand(ToolchainCommands.CHECK_TOOLCHAIN, {
            execute: () => this.checkToolchain(),
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        // Assembly menu
        menus.registerSubmenu(['menubar', 'assembly'], 'Assembly');

        menus.registerMenuAction(['menubar', 'assembly'], {
            commandId: ToolchainCommands.ASSEMBLE_FILE.id,
            order: '1',
        });

        menus.registerMenuAction(['menubar', 'assembly'], {
            commandId: ToolchainCommands.ASSEMBLE_AND_LINK.id,
            order: '2',
        });

        menus.registerMenuAction(['menubar', 'assembly'], {
            commandId: ToolchainCommands.GENERATE_LISTING.id,
            order: '3',
        });

        menus.registerMenuAction(['menubar', 'assembly'], {
            commandId: ToolchainCommands.SET_ASSEMBLER.id,
            order: '10',
        });

        menus.registerMenuAction(['menubar', 'assembly'], {
            commandId: ToolchainCommands.CHECK_TOOLCHAIN.id,
            order: '11',
        });
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybinding({
            command: ToolchainCommands.ASSEMBLE_FILE.id,
            keybinding: 'f5',
        });

        keybindings.registerKeybinding({
            command: ToolchainCommands.ASSEMBLE_AND_LINK.id,
            keybinding: 'ctrl+f5',
        });
    }

    private hasAssemblyFileOpen(): boolean {
        const editor = this.editorManager.currentEditor;
        if (!editor) return false;
        const uri = editor.editor.uri.toString();
        return /\.(asm|s|S|inc|nasm)$/i.test(uri);
    }

    private async getCurrentFileUri(): Promise<string | undefined> {
        const editor = this.editorManager.currentEditor;
        return editor?.editor.uri.toString();
    }

    private async getCurrentFileContent(): Promise<string | undefined> {
        const editor = this.editorManager.currentEditor;
        if (!editor) return undefined;
        return editor.editor.document.getText();
    }

    private async assembleCurrentFile(linkAfter: boolean): Promise<void> {
        const fileUri = await this.getCurrentFileUri();
        if (!fileUri) {
            this.messageService.warn('No assembly file is open');
            return;
        }

        // Save file first
        const editor = this.editorManager.currentEditor;
        if (editor?.editor.document.dirty) {
            await editor.saveable.save();
        }

        const output = this.getOutputChannel();
        output.clear();
        output.show({ preserveFocus: true });
        output.appendLine('=== AsmForge Build ===');
        output.appendLine(`File: ${fileUri}`);
        output.appendLine('');

        // Detect or use configured assembler
        const content = await this.getCurrentFileContent();
        let assemblerType: AssemblerType = this.getPreference('asmforge.assembler.default', 'nasm');

        if (this.getPreference('asmforge.assembler.autoDetect', true) && content) {
            const detected = detectAssemblerFromSyntax(content);
            if (detected.confidence > 0.5) {
                assemblerType = detected.type;
                output.appendLine(
                    `Detected assembler: ${assemblerType} (confidence: ${(detected.confidence * 100).toFixed(0)}%)`
                );
            }
        }

        output.appendLine(`Using assembler: ${assemblerType.toUpperCase()}`);
        output.appendLine('');

        // Build configuration
        const config = this.buildConfig(fileUri, assemblerType, linkAfter);

        try {
            output.appendLine('Assembling...');
            const result = await this.assemblerService.assemble(config);

            // Update diagnostics
            if (result.diagnostics && result.diagnostics.length > 0) {
                this.diagnosticProvider.setDiagnostics(fileUri, result.diagnostics);
            } else {
                this.diagnosticProvider.clearDiagnostics(fileUri);
            }

            // Show output
            if (result.stdout) {
                output.appendLine(result.stdout);
            }
            if (result.stderr) {
                output.appendLine(result.stderr);
            }

            if (result.success) {
                output.appendLine('');
                output.appendLine(`✓ Assembly successful (${result.duration}ms)`);
                output.appendLine(`Output: ${result.outputFile}`);

                if (linkAfter && result.outputFile) {
                    output.appendLine('');
                    output.appendLine('Linking...');

                    const outputExe = result.outputFile.replace(/\.o$/, '');
                    const linkerFlags = this.getPreference<string>(
                        'asmforge.linker.flags',
                        '-nostdlib'
                    ).split(' ');

                    const linkResult = await this.assemblerService.link(
                        [result.outputFile],
                        outputExe,
                        linkerFlags
                    );

                    if (linkResult.success) {
                        output.appendLine(`✓ Linking successful`);
                        output.appendLine(`Executable: ${outputExe}`);
                        this.messageService.info(`Build complete: ${outputExe}`);
                    } else {
                        output.appendLine(`✗ Linking failed`);
                        if (linkResult.stderr) output.appendLine(linkResult.stderr);
                        this.messageService.error('Linking failed - see Output panel');
                    }
                } else {
                    this.messageService.info(`Assembly complete: ${result.outputFile}`);
                }
            } else {
                output.appendLine('');
                output.appendLine(`✗ Assembly failed (exit code: ${result.exitCode})`);
                this.messageService.error(
                    `Assembly failed with ${result.diagnostics?.length || 0} error(s)`
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            output.appendLine(`Error: ${message}`);
            this.messageService.error(`Build error: ${message}`);
        }
    }

    private buildConfig(
        fileUri: string,
        assemblerType: AssemblerType,
        linkAfter: boolean
    ): BuildConfig {
        const filePath = fileUri.replace('file://', '');

        const defaultConfig = DEFAULT_ASSEMBLER_CONFIGS[assemblerType];
        const additionalFlags = this.getPreference<string>(
            'asmforge.assembler.additionalFlags',
            ''
        );

        const assemblerConfig: AssemblerConfig = {
            type: assemblerType,
            executable: this.getPreference(
                `asmforge.paths.${assemblerType}`,
                defaultConfig.executable || assemblerType
            ),
            architecture: this.getPreference<ArchitectureTarget>(
                'asmforge.assembler.architecture',
                'x86_64'
            ),
            outputFormat: this.getPreference<OutputFormat>(
                'asmforge.assembler.outputFormat',
                'elf64'
            ),
            additionalFlags: additionalFlags
                ? additionalFlags.split(' ')
                : defaultConfig.additionalFlags || [],
            includePaths: this.getPreference<string[]>('asmforge.assembler.includePaths', []),
            defines: {},
        };

        return {
            name: 'Build',
            sourceFile: filePath,
            assembler: assemblerConfig,
            linkAfterAssemble: linkAfter,
            linkerFlags: this.getPreference<string>('asmforge.linker.flags', '-nostdlib').split(
                ' '
            ),
            generateListing: this.getPreference<boolean>('asmforge.build.generateListing', false),
            generateMap: false,
        };
    }

    private async generateListing(): Promise<void> {
        const fileUri = await this.getCurrentFileUri();
        if (!fileUri) return;

        // Save and assemble with listing generation enabled
        const editor = this.editorManager.currentEditor;
        if (editor?.editor.document.dirty) {
            await editor.saveable.save();
        }

        const output = this.getOutputChannel();
        output.clear();
        output.show({ preserveFocus: true });
        output.appendLine('Generating listing file...');

        const content = await this.getCurrentFileContent();
        let assemblerType: AssemblerType = this.getPreference('asmforge.assembler.default', 'nasm');

        if (this.getPreference('asmforge.assembler.autoDetect', true) && content) {
            const detected = detectAssemblerFromSyntax(content);
            if (detected.confidence > 0.5) {
                assemblerType = detected.type;
            }
        }

        const config = this.buildConfig(fileUri, assemblerType, false);
        config.generateListing = true;

        try {
            const result = await this.assemblerService.assemble(config);

            if (result.success) {
                output.appendLine(
                    `✓ Listing generated: ${result.listingFile || 'see file directory'}`
                );
                this.messageService.info('Listing file generated');
            } else {
                output.appendLine('✗ Failed to generate listing');
                this.messageService.error('Failed to generate listing');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            output.appendLine(`Error: ${message}`);
        }
    }

    private async setDefaultAssembler(): Promise<void> {
        const items: QuickPickItem[] = [
            { label: 'NASM', description: 'Netwide Assembler (x86/x86-64)', id: 'nasm' },
            { label: 'GAS', description: 'GNU Assembler (multi-architecture)', id: 'gas' },
            { label: 'LLVM', description: 'LLVM Machine Code (llvm-mc)', id: 'llvm' },
            { label: 'armasm', description: 'ARM Assembler', id: 'armasm' },
        ];

        const selected = await this.quickPick.show(items, {
            placeholder: 'Select default assembler',
        });

        if (selected) {
            this.setPreference('asmforge.assembler.default', selected.id);
            this.messageService.info(`Default assembler set to ${selected.label}`);
        }
    }

    private async detectAssembler(): Promise<void> {
        const content = await this.getCurrentFileContent();
        if (!content) {
            this.messageService.warn('No file content to analyze');
            return;
        }

        const detected = detectAssemblerFromSyntax(content);
        this.messageService.info(
            `Detected: ${detected.type.toUpperCase()} (${(detected.confidence * 100).toFixed(0)}% confidence)`
        );
    }

    private async checkToolchain(): Promise<void> {
        const output = this.getOutputChannel();
        output.clear();
        output.show();
        output.appendLine('=== Checking Installed Toolchain ===');
        output.appendLine('');

        const assemblers: AssemblerType[] = ['nasm', 'gas', 'llvm', 'armasm'];

        for (const type of assemblers) {
            try {
                const check = await this.assemblerService.checkAssembler(type);
                if (check.available) {
                    output.appendLine(`✓ ${type.toUpperCase()}: ${check.version || 'available'}`);
                } else {
                    output.appendLine(`✗ ${type.toUpperCase()}: not found`);
                }
            } catch {
                output.appendLine(`✗ ${type.toUpperCase()}: error checking`);
            }
        }

        output.appendLine('');
        output.appendLine('Done.');
    }
}
