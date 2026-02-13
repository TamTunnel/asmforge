/**
 * Memory Viewer - Theia Contributions
 */

import { injectable } from '@theia/core/shared/inversify';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { KeybindingRegistry } from '@theia/core/lib/browser';
import { AbstractViewContribution, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { FrontendApplication } from '@theia/core/lib/browser/frontend-application';
import { MemoryViewerWidget, MEMORY_VIEWER_ID } from './memory-widget';

export const MemoryViewerCommands = {
    TOGGLE: {
        id: 'memory-viewer.toggle',
        label: 'Toggle Memory View',
        category: 'View',
    } as Command,

    JUMP_TO_ADDRESS: {
        id: 'memory-viewer.jumpToAddress',
        label: 'Jump to Address',
        category: 'Debug',
    } as Command,
};

@injectable()
export class MemoryViewerContribution
    extends AbstractViewContribution<MemoryViewerWidget>
    implements FrontendApplicationContribution
{
    constructor() {
        super({
            widgetId: MEMORY_VIEWER_ID,
            widgetName: 'Memory',
            defaultWidgetOptions: {
                area: 'bottom',
                rank: 400,
            },
            toggleCommandId: MemoryViewerCommands.TOGGLE.id,
        });
    }

    async initializeLayout(_app: FrontendApplication): Promise<void> {
        // Widget starts closed
    }

    registerCommands(registry: CommandRegistry): void {
        super.registerCommands(registry);
    }

    registerMenus(_menus: MenuModelRegistry): void {
        // Menu registration if needed
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybinding({
            command: MemoryViewerCommands.TOGGLE.id,
            keybinding: 'ctrlcmd+shift+m',
        });
    }
}
