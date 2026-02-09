/**
 * NOVA Assembly IDE - Core Frontend Module
 *
 * This module wires the core NOVA components into the Theia application.
 * It provides:
 * - Welcome view
 * - Global preferences
 * - Keyboard shortcuts
 * - Status bar contributions
 * - Custom commands
 */

import { ContainerModule } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { KeybindingContribution } from '@theia/core/lib/browser';
import { NovaWelcomeContribution } from './nova-welcome-contribution';
import { AssemblyKeybindingContribution } from './keyboard-shortcuts';
import { bindCorePreferences } from './core-preferences';

export default new ContainerModule((bind) => {
    // Register preferences
    bindCorePreferences(bind);

    // Register the welcome contribution
    bind(NovaWelcomeContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(NovaWelcomeContribution);

    // Register keyboard shortcuts
    bind(AssemblyKeybindingContribution).toSelf().inSingletonScope();
    bind(KeybindingContribution).toService(AssemblyKeybindingContribution);
});
