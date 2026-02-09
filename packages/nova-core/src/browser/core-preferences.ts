/**
 * Nova Core - Global Preferences
 * Central settings for AsmForge IDE
 */

import { interfaces } from '@theia/core/shared/inversify';
import {
    createPreferenceProxy,
    PreferenceProxy,
    PreferenceService,
    PreferenceContribution,
    PreferenceSchema,
} from '@theia/core/lib/browser/preferences';

/** Core preference schema */
export const CorePreferenceSchema: PreferenceSchema = {
    type: 'object',
    properties: {
        // =============================================
        // Architecture Settings
        // =============================================
        'asmforge.architecture.default': {
            type: 'string',
            default: 'x86_64',
            enum: ['x86', 'x86_64', 'arm', 'arm64', 'riscv32', 'riscv64'],
            enumDescriptions: [
                'Intel/AMD 32-bit (i386)',
                'Intel/AMD 64-bit (AMD64)',
                'ARM 32-bit (AArch32)',
                'ARM 64-bit (AArch64)',
                'RISC-V 32-bit',
                'RISC-V 64-bit',
            ],
            description: 'Default target architecture for new assembly files',
        },
        'asmforge.architecture.autoDetect': {
            type: 'boolean',
            default: true,
            description: 'Automatically detect architecture from file content',
        },

        // =============================================
        // AI Assistant Settings
        // =============================================
        'asmforge.ai.enabled': {
            type: 'boolean',
            default: true,
            description: 'Enable AI assistant features',
        },
        'asmforge.ai.model': {
            type: 'string',
            default: 'default',
            enum: ['default', 'asma-tune', 'custom'],
            enumDescriptions: [
                'Default AI model',
                'ASMA-Tune (specialized for assembly)',
                'Custom model configuration',
            ],
            description: 'AI model to use for code assistance',
        },
        'asmforge.ai.customEndpoint': {
            type: 'string',
            default: '',
            description: 'Custom AI API endpoint (when model is set to custom)',
        },
        'asmforge.ai.contextLines': {
            type: 'number',
            default: 100,
            minimum: 10,
            maximum: 500,
            description: 'Number of context lines to send to AI for analysis',
        },
        'asmforge.ai.showInlineHints': {
            type: 'boolean',
            default: true,
            description: 'Show inline AI suggestions while typing',
        },

        // =============================================
        // Theme & Appearance
        // =============================================
        'asmforge.theme.syntaxStyle': {
            type: 'string',
            default: 'default',
            enum: ['default', 'retro', 'high-contrast', 'minimal'],
            description: 'Assembly syntax highlighting style',
        },
        'asmforge.theme.showRegisterColors': {
            type: 'boolean',
            default: true,
            description: 'Color-code registers by category (general, segment, etc.)',
        },
        'asmforge.theme.highlightNumberFormats': {
            type: 'boolean',
            default: true,
            description: 'Different colors for hex, binary, and decimal numbers',
        },

        // =============================================
        // Editor Settings
        // =============================================
        'asmforge.editor.showAddresses': {
            type: 'boolean',
            default: false,
            description: 'Show memory addresses in editor gutter (when available)',
        },
        'asmforge.editor.showOpcodes': {
            type: 'boolean',
            default: false,
            description: 'Show assembled opcodes next to instructions',
        },
        'asmforge.editor.tabSize': {
            type: 'number',
            default: 8,
            minimum: 2,
            maximum: 16,
            description: 'Tab size for assembly files (8 is traditional)',
        },
        'asmforge.editor.labelIndent': {
            type: 'number',
            default: 0,
            description: 'Column for labels (0 = left margin)',
        },
        'asmforge.editor.instructionIndent': {
            type: 'number',
            default: 8,
            description: 'Column for instructions',
        },
        'asmforge.editor.commentIndent': {
            type: 'number',
            default: 40,
            description: 'Column for inline comments',
        },
    },
};

/** Preference configuration interface for type safety */
export interface CorePreferenceConfiguration {
    // Architecture
    'asmforge.architecture.default': string;
    'asmforge.architecture.autoDetect': boolean;

    // AI
    'asmforge.ai.enabled': boolean;
    'asmforge.ai.model': string;
    'asmforge.ai.customEndpoint': string;
    'asmforge.ai.contextLines': number;
    'asmforge.ai.showInlineHints': boolean;

    // Theme
    'asmforge.theme.syntaxStyle': string;
    'asmforge.theme.showRegisterColors': boolean;
    'asmforge.theme.highlightNumberFormats': boolean;

    // Editor
    'asmforge.editor.showAddresses': boolean;
    'asmforge.editor.showOpcodes': boolean;
    'asmforge.editor.tabSize': number;
    'asmforge.editor.labelIndent': number;
    'asmforge.editor.instructionIndent': number;
    'asmforge.editor.commentIndent': number;
}

export const CorePreferences = Symbol('CorePreferences');
export type CorePreferences = PreferenceProxy<CorePreferenceConfiguration>;

export function createCorePreferences(preferences: PreferenceService): CorePreferences {
    return createPreferenceProxy(preferences, CorePreferenceSchema);
}

export function bindCorePreferences(bind: interfaces.Bind): void {
    bind(CorePreferences)
        .toDynamicValue((ctx) => {
            const preferences = ctx.container.get<PreferenceService>(PreferenceService);
            return createCorePreferences(preferences);
        })
        .inSingletonScope();

    bind(PreferenceContribution).toConstantValue({
        schema: CorePreferenceSchema,
    });
}
