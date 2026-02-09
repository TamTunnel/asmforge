/**
 * Assembly Tools - Tool Function Providers
 *
 * Tool functions that allow the AI agent to interact with the IDE:
 * - Get active file content
 * - Get selected code
 * - Insert code at cursor
 * - Replace selection
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import { ToolProvider, ToolRequest } from '@theia/ai-core';
import { EditorManager, TextEditor } from '@theia/editor/lib/browser';
import { MonacoEditor } from '@theia/monaco/lib/browser/monaco-editor';

/**
 * Tool to get the content of the currently active file
 */
@injectable()
export class GetActiveFileContentTool implements ToolProvider {
    static readonly ID = 'getActiveFileContent';

    @inject(EditorManager)
    protected editorManager!: EditorManager;

    getTool(): ToolRequest {
        return {
            id: GetActiveFileContentTool.ID,
            name: GetActiveFileContentTool.ID,
            description:
                'Get the full content of the currently active editor file. ' +
                'Returns the file path and content.',
            parameters: {
                type: 'object',
                properties: {},
            },
            handler: async () => {
                const editor = this.editorManager.currentEditor;
                if (!editor) {
                    return JSON.stringify({
                        success: false,
                        error: 'No active editor',
                    });
                }

                const textEditor = editor.editor as TextEditor;
                const uri = textEditor.uri.toString();
                const content = textEditor.document.getText();

                return JSON.stringify({
                    success: true,
                    filePath: uri,
                    content: content,
                    lineCount: textEditor.document.lineCount,
                });
            },
        };
    }
}

/**
 * Tool to get the currently selected code in the editor
 */
@injectable()
export class GetSelectedCodeTool implements ToolProvider {
    static readonly ID = 'getSelectedCode';

    @inject(EditorManager)
    protected editorManager!: EditorManager;

    getTool(): ToolRequest {
        return {
            id: GetSelectedCodeTool.ID,
            name: GetSelectedCodeTool.ID,
            description:
                'Get the currently selected text in the active editor. ' +
                'Returns the selection and its location.',
            parameters: {
                type: 'object',
                properties: {},
            },
            handler: async () => {
                const editor = this.editorManager.currentEditor;
                if (!editor) {
                    return JSON.stringify({
                        success: false,
                        error: 'No active editor',
                    });
                }

                const monacoEditor = editor.editor as MonacoEditor;
                const control = monacoEditor.getControl();
                const selection = control.getSelection();

                if (!selection || selection.isEmpty()) {
                    return JSON.stringify({
                        success: false,
                        error: 'No text selected',
                    });
                }

                const model = control.getModel();
                if (!model) {
                    return JSON.stringify({
                        success: false,
                        error: 'No editor model',
                    });
                }

                const selectedText = model.getValueInRange(selection);

                return JSON.stringify({
                    success: true,
                    selectedText: selectedText,
                    startLine: selection.startLineNumber,
                    endLine: selection.endLineNumber,
                    startColumn: selection.startColumn,
                    endColumn: selection.endColumn,
                });
            },
        };
    }
}

/**
 * Tool to insert code at the current cursor position
 */
@injectable()
export class InsertCodeAtCursorTool implements ToolProvider {
    static readonly ID = 'insertCodeAtCursor';

    @inject(EditorManager)
    protected editorManager!: EditorManager;

    getTool(): ToolRequest {
        return {
            id: InsertCodeAtCursorTool.ID,
            name: InsertCodeAtCursorTool.ID,
            description: 'Insert code at the current cursor position in the active editor.',
            parameters: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'The code to insert at the cursor position',
                    },
                },
                required: ['code'],
            },
            handler: async (argString: string) => {
                try {
                    const args = JSON.parse(argString);
                    const code = args.code as string;

                    const editor = this.editorManager.currentEditor;
                    if (!editor) {
                        return JSON.stringify({
                            success: false,
                            error: 'No active editor',
                        });
                    }

                    const monacoEditor = editor.editor as MonacoEditor;
                    const control = monacoEditor.getControl();
                    const position = control.getPosition();

                    if (!position) {
                        return JSON.stringify({
                            success: false,
                            error: 'No cursor position',
                        });
                    }

                    // Insert the code at the cursor position
                    control.executeEdits('ai-agent', [
                        {
                            range: {
                                startLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column,
                            },
                            text: code,
                        },
                    ]);

                    return JSON.stringify({
                        success: true,
                        insertedAt: {
                            line: position.lineNumber,
                            column: position.column,
                        },
                    });
                } catch (error) {
                    return JSON.stringify({
                        success: false,
                        error: `Failed to parse arguments: ${error}`,
                    });
                }
            },
        };
    }
}

/**
 * Tool to replace the current selection with new code
 */
@injectable()
export class ReplaceSelectionTool implements ToolProvider {
    static readonly ID = 'replaceSelection';

    @inject(EditorManager)
    protected editorManager!: EditorManager;

    getTool(): ToolRequest {
        return {
            id: ReplaceSelectionTool.ID,
            name: ReplaceSelectionTool.ID,
            description: 'Replace the currently selected text in the active editor with new code.',
            parameters: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'The code to replace the selection with',
                    },
                },
                required: ['code'],
            },
            handler: async (argString: string) => {
                try {
                    const args = JSON.parse(argString);
                    const code = args.code as string;

                    const editor = this.editorManager.currentEditor;
                    if (!editor) {
                        return JSON.stringify({
                            success: false,
                            error: 'No active editor',
                        });
                    }

                    const monacoEditor = editor.editor as MonacoEditor;
                    const control = monacoEditor.getControl();
                    const selection = control.getSelection();

                    if (!selection || selection.isEmpty()) {
                        return JSON.stringify({
                            success: false,
                            error: 'No text selected',
                        });
                    }

                    // Replace the selection with new code
                    control.executeEdits('ai-agent', [
                        {
                            range: selection,
                            text: code,
                        },
                    ]);

                    return JSON.stringify({
                        success: true,
                        replacedRange: {
                            startLine: selection.startLineNumber,
                            endLine: selection.endLineNumber,
                        },
                    });
                } catch (error) {
                    return JSON.stringify({
                        success: false,
                        error: `Failed to parse arguments: ${error}`,
                    });
                }
            },
        };
    }
}
