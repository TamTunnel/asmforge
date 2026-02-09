/**
 * Register Viewer - Theia Contributions
 * Commands, menus, and keybindings
 */

import { injectable } from '@theia/core/shared/inversify';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { KeybindingRegistry } from '@theia/core/lib/browser';
import { AbstractViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { FrontendApplication } from '@theia/core/lib/browser/frontend-application';
import { RegisterViewerWidget, REGISTER_VIEWER_ID } from './register-widget';

/** Command definitions */
export namespace RegisterViewerCommands {
    export const TOGGLE: Command = {
        id: 'register-viewer.toggle',
        label: 'Toggle CPU Registers',
        category: 'View',
    };

    export const SIMULATE_CHANGE: Command = {
        id: 'register-viewer.simulateChange',
        label: 'Simulate Register Change',
        category: 'Debug',
    };
}

@injectable()
export class RegisterViewerContribution
    extends AbstractViewContribution<RegisterViewerWidget>
    implements FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: REGISTER_VIEWER_ID,
            widgetName: 'CPU Registers',
            defaultWidgetOptions: {
                area: 'right',
                rank: 500,
            },
            toggleCommandId: RegisterViewerCommands.TOGGLE.id,
        });
    }

    async initializeLayout(_app: FrontendApplication): Promise<void> {
        // Widget starts closed by default, user opens via command/menu
    }

    registerCommands(registry: CommandRegistry): void {
        super.registerCommands(registry);

        registry.registerCommand(RegisterViewerCommands.SIMULATE_CHANGE, {
            execute: async () => {
                const widget = await this.widget;
                if (widget) {
                    // Access service through widget (we'll cast for now)
                    // In production, inject service directly
                    (
                        widget as unknown as { handleSimulateChange: () => void }
                    ).handleSimulateChange?.();
                }
            },
            isEnabled: () => true,
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybinding({
            command: RegisterViewerCommands.TOGGLE.id,
            keybinding: 'ctrlcmd+shift+r',
        });
    }
}
