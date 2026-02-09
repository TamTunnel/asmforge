/**
 * Toolchain - Frontend Module
 */

import { ContainerModule } from '@theia/core/shared/inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { KeybindingContribution } from '@theia/core/lib/browser';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser/messaging/ws-connection-provider';

import { ToolchainContribution, AssemblerServiceClient } from './toolchain-contribution';
import {
    ToolchainDiagnosticProvider,
    ToolchainDiagnosticProviderImpl,
} from './toolchain-diagnostic-provider';
import { DebugContribution } from './debug-contribution';
import { ASSEMBLER_SERVICE_PATH } from '../node/toolchain-backend-module';

export default new ContainerModule((bind) => {
    // Bind diagnostic provider
    bind(ToolchainDiagnosticProvider).to(ToolchainDiagnosticProviderImpl).inSingletonScope();

    // Bind remote assembler service client
    bind(AssemblerServiceClient)
        .toDynamicValue((ctx) => {
            const connection = ctx.container.get(WebSocketConnectionProvider);
            return connection.createProxy<AssemblerServiceClient>(ASSEMBLER_SERVICE_PATH);
        })
        .inSingletonScope();

    // Bind toolchain contributions
    bind(ToolchainContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(ToolchainContribution);
    bind(MenuContribution).toService(ToolchainContribution);
    bind(KeybindingContribution).toService(ToolchainContribution);

    // Bind debug contributions
    bind(DebugContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(DebugContribution);
});
