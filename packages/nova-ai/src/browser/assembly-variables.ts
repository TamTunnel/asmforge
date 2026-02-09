/**
 * Assembly Variables - Variable Providers
 *
 * Context variables that provide dynamic data to the AI agent:
 * - Active file content
 * - Selected code
 * - Architecture preference
 * - File name
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import {
    AIVariableContribution,
    AIVariable,
    AIVariableService,
    AIVariableResolver,
    AIVariableResolutionRequest,
    AIVariableContext,
    ResolvedAIVariable,
} from '@theia/ai-core';
import { EditorManager, TextEditor } from '@theia/editor/lib/browser';
import { MonacoEditor } from '@theia/monaco/lib/browser/monaco-editor';

/**
 * Variable provider for current file content and selection
 */
@injectable()
export class AssemblyContextVariables implements AIVariableContribution {
    @inject(EditorManager)
    protected editorManager!: EditorManager;

    /**
     * Register all assembly-specific variables
     */
    registerVariables(service: AIVariableService): void {
        // Active file content
        const activeFileVar: AIVariable = {
            id: 'activeFileContent',
            name: 'activeFileContent',
            description: 'Content of the currently active editor file',
        };
        service.registerVariable(activeFileVar);
        service.registerResolver(activeFileVar, this.createActiveFileResolver());

        // Selected code
        const selectedCodeVar: AIVariable = {
            id: 'selectedCode',
            name: 'selectedCode',
            description: 'Currently selected text in the editor',
        };
        service.registerVariable(selectedCodeVar);
        service.registerResolver(selectedCodeVar, this.createSelectedCodeResolver());

        // Architecture preference
        const archVar: AIVariable = {
            id: 'architecturePreference',
            name: 'architecturePreference',
            description: 'Detected assembly architecture based on file extension',
        };
        service.registerVariable(archVar);
        service.registerResolver(archVar, this.createArchitectureResolver());

        // File name
        const fileNameVar: AIVariable = {
            id: 'fileName',
            name: 'fileName',
            description: 'Name of the current file',
        };
        service.registerVariable(fileNameVar);
        service.registerResolver(fileNameVar, this.createFileNameResolver());
    }

    private createActiveFileResolver(): AIVariableResolver {
        return {
            canResolve: () => 1,
            resolve: async (
                request: AIVariableResolutionRequest,
                _context: AIVariableContext
            ): Promise<ResolvedAIVariable | undefined> => {
                const editor = this.editorManager.currentEditor;
                if (!editor) {
                    return {
                        variable: request.variable,
                        value: '(No file open)',
                    };
                }
                const textEditor = editor.editor as TextEditor;
                return {
                    variable: request.variable,
                    value: textEditor.document.getText(),
                };
            },
        };
    }

    private createSelectedCodeResolver(): AIVariableResolver {
        return {
            canResolve: () => 1,
            resolve: async (
                request: AIVariableResolutionRequest,
                _context: AIVariableContext
            ): Promise<ResolvedAIVariable | undefined> => {
                const editor = this.editorManager.currentEditor;
                if (!editor) {
                    return {
                        variable: request.variable,
                        value: '(No selection)',
                    };
                }

                try {
                    const monacoEditor = editor.editor as MonacoEditor;
                    const control = monacoEditor.getControl();
                    const selection = control.getSelection();

                    if (!selection || selection.isEmpty()) {
                        return {
                            variable: request.variable,
                            value: '(No selection)',
                        };
                    }

                    const model = control.getModel();
                    if (!model) {
                        return {
                            variable: request.variable,
                            value: '(No selection)',
                        };
                    }

                    return {
                        variable: request.variable,
                        value: model.getValueInRange(selection),
                    };
                } catch {
                    return {
                        variable: request.variable,
                        value: '(No selection)',
                    };
                }
            },
        };
    }

    private createArchitectureResolver(): AIVariableResolver {
        return {
            canResolve: () => 1,
            resolve: async (
                request: AIVariableResolutionRequest,
                _context: AIVariableContext
            ): Promise<ResolvedAIVariable | undefined> => {
                const editor = this.editorManager.currentEditor;
                if (!editor) {
                    return {
                        variable: request.variable,
                        value: 'x86-64',
                    };
                }

                const textEditor = editor.editor as TextEditor;
                const uri = textEditor.uri.toString().toLowerCase();

                // Detect architecture from file extension
                let arch = 'x86-64';
                if (uri.endsWith('.arm') || uri.endsWith('.aarch64')) {
                    arch = 'ARM/AArch64';
                } else if (
                    uri.endsWith('.riscv') ||
                    uri.endsWith('.rv') ||
                    uri.endsWith('.rv32') ||
                    uri.endsWith('.rv64')
                ) {
                    arch = 'RISC-V';
                } else if (uri.endsWith('.s') || uri.endsWith('.S')) {
                    // GAS syntax - try to detect from content
                    const content = textEditor.document.getText().toLowerCase();
                    if (
                        content.includes('stp ') ||
                        content.includes('ldp ') ||
                        content.includes('svc ')
                    ) {
                        arch = 'ARM/AArch64';
                    } else if (content.includes('ecall') || content.includes('addi ')) {
                        arch = 'RISC-V';
                    } else {
                        arch = 'x86-64 (GAS syntax)';
                    }
                }

                return {
                    variable: request.variable,
                    value: arch,
                };
            },
        };
    }

    private createFileNameResolver(): AIVariableResolver {
        return {
            canResolve: () => 1,
            resolve: async (
                request: AIVariableResolutionRequest,
                _context: AIVariableContext
            ): Promise<ResolvedAIVariable | undefined> => {
                const editor = this.editorManager.currentEditor;
                if (!editor) {
                    return {
                        variable: request.variable,
                        value: '(No file)',
                    };
                }
                const textEditor = editor.editor as TextEditor;
                return {
                    variable: request.variable,
                    value: textEditor.uri.path.base,
                };
            },
        };
    }
}
