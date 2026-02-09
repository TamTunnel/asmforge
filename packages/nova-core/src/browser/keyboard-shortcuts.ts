/**
 * Nova Core - Keyboard Shortcuts
 * Assembly-optimized keybindings for AsmForge IDE
 */

import { injectable } from '@theia/core/shared/inversify';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser';

/** Assembly-specific keyboard shortcuts */
@injectable()
export class AssemblyKeybindingContribution implements KeybindingContribution {
    registerKeybindings(keybindings: KeybindingRegistry): void {
        // =============================================
        // Build Shortcuts
        // =============================================
        keybindings.registerKeybinding({
            command: 'asmforge.toolchain.assemble',
            keybinding: 'f5',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.toolchain.assembleAndLink',
            keybinding: 'ctrlcmd+f5',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.toolchain.generateListing',
            keybinding: 'ctrlcmd+shift+l',
            context: 'editorTextFocus',
        });

        // =============================================
        // Debug Shortcuts
        // =============================================
        keybindings.registerKeybinding({
            command: 'asmforge.debug.start',
            keybinding: 'f6',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.debug.stepInstruction',
            keybinding: 'f10',
            context: 'debugContext',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.debug.stepInto',
            keybinding: 'f11',
            context: 'debugContext',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.debug.stepOut',
            keybinding: 'shift+f11',
            context: 'debugContext',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.debug.continue',
            keybinding: 'f8',
            context: 'debugContext',
        });

        // =============================================
        // View Shortcuts
        // =============================================
        keybindings.registerKeybinding({
            command: 'asmforge.view.registers',
            keybinding: 'ctrlcmd+shift+r',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.view.memory',
            keybinding: 'ctrlcmd+shift+m',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'nova-ai.openChat',
            keybinding: 'ctrlcmd+shift+a',
            context: 'editorTextFocus',
        });

        // =============================================
        // Navigation Shortcuts
        // =============================================
        keybindings.registerKeybinding({
            command: 'asmforge.navigation.goToLabel',
            keybinding: 'ctrlcmd+g',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.navigation.findReferences',
            keybinding: 'shift+f12',
            context: 'editorTextFocus',
        });

        // =============================================
        // Code Actions
        // =============================================
        keybindings.registerKeybinding({
            command: 'asmforge.code.formatDocument',
            keybinding: 'ctrlcmd+shift+f',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.code.insertComment',
            keybinding: 'ctrlcmd+/',
            context: 'editorTextFocus',
        });

        keybindings.registerKeybinding({
            command: 'asmforge.code.toggleHexBin',
            keybinding: 'ctrlcmd+h',
            context: 'editorTextFocus',
        });
    }
}

/** Keyboard shortcut reference (for documentation) */
export const SHORTCUT_REFERENCE = {
    build: [
        { key: 'F5', action: 'Assemble File' },
        { key: 'Ctrl+F5', action: 'Assemble & Link' },
        { key: 'Ctrl+Shift+L', action: 'Generate Listing' },
    ],
    debug: [
        { key: 'F6', action: 'Start Debugging' },
        { key: 'F8', action: 'Continue' },
        { key: 'F10', action: 'Step Over (Instruction)' },
        { key: 'F11', action: 'Step Into' },
        { key: 'Shift+F11', action: 'Step Out' },
    ],
    views: [
        { key: 'Ctrl+Shift+R', action: 'Toggle Register View' },
        { key: 'Ctrl+Shift+M', action: 'Toggle Memory View' },
        { key: 'Ctrl+Shift+A', action: 'Open AI Assistant' },
    ],
    navigation: [
        { key: 'Ctrl+G', action: 'Go to Label/Symbol' },
        { key: 'Shift+F12', action: 'Find References' },
        { key: 'F12', action: 'Go to Definition' },
    ],
    editing: [
        { key: 'Ctrl+Shift+F', action: 'Format Document' },
        { key: 'Ctrl+/', action: 'Toggle Comment' },
        { key: 'Ctrl+H', action: 'Toggle Hex/Binary' },
    ],
};
