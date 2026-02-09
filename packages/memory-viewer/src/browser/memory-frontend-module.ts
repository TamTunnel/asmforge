/**
 * Memory Viewer - Frontend Module
 */

import { ContainerModule } from '@theia/core/shared/inversify';
import {
    FrontendApplicationContribution,
    WidgetFactory,
    bindViewContribution,
} from '@theia/core/lib/browser';

import { MemoryViewerWidget, MEMORY_VIEWER_ID } from './memory-widget';
import { MemoryService, MemoryServiceImpl } from './memory-service';
import { MemoryViewerContribution } from './memory-contribution';

export default new ContainerModule((bind) => {
    // Bind memory service as singleton
    bind(MemoryService).to(MemoryServiceImpl).inSingletonScope();

    // Bind widget
    bind(MemoryViewerWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue((ctx) => ({
            id: MEMORY_VIEWER_ID,
            createWidget: () => ctx.container.get(MemoryViewerWidget),
        }))
        .inSingletonScope();

    // Bind contributions
    bindViewContribution(bind, MemoryViewerContribution);
    bind(FrontendApplicationContribution).toService(MemoryViewerContribution);
});
