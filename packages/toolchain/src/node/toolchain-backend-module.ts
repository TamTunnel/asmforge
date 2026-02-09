/**
 * Toolchain - Backend Module
 */

import { ContainerModule } from '@theia/core/shared/inversify';
import { AssemblerService, AssemblerServiceImpl } from './assembler-service';
import { GdbDebugSession, GdbDebugSessionImpl } from './gdb-debug-session';
import { ConnectionHandler, RpcConnectionHandler } from '@theia/core/lib/common/messaging';

export const ASSEMBLER_SERVICE_PATH = '/services/assembler';
export const GDB_DEBUG_SERVICE_PATH = '/services/gdb-debug';

export default new ContainerModule((bind) => {
    // Bind assembler service
    bind(AssemblerService).to(AssemblerServiceImpl).inSingletonScope();

    // Expose via RPC
    bind(ConnectionHandler)
        .toDynamicValue((ctx) => {
            const service = ctx.container.get<AssemblerService>(AssemblerService);
            return new RpcConnectionHandler(ASSEMBLER_SERVICE_PATH, () => service);
        })
        .inSingletonScope();

    // Bind GDB debug session
    bind(GdbDebugSession).to(GdbDebugSessionImpl).inSingletonScope();

    // Expose GDB session via RPC
    bind(ConnectionHandler)
        .toDynamicValue((ctx) => {
            const service = ctx.container.get<GdbDebugSession>(GdbDebugSession);
            return new RpcConnectionHandler(GDB_DEBUG_SERVICE_PATH, () => service);
        })
        .inSingletonScope();
});
