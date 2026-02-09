/**
 * Register Viewer - Frontend Module
 * Dependency injection bindings
 */

import { ContainerModule } from '@theia/core/shared/inversify';
import {
    FrontendApplicationContribution,
    WidgetFactory,
    bindViewContribution,
} from '@theia/core/lib/browser';

import { RegisterViewerWidget, REGISTER_VIEWER_ID } from './register-widget';
import { RegisterService, RegisterServiceImpl } from './register-service';
import { RegisterViewerContribution } from './register-contribution';

export default new ContainerModule((bind) => {
    // Bind the register service as singleton
    bind(RegisterService).to(RegisterServiceImpl).inSingletonScope();

    // Bind the widget
    bind(RegisterViewerWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue((ctx) => ({
            id: REGISTER_VIEWER_ID,
            createWidget: () => ctx.container.get(RegisterViewerWidget),
        }))
        .inSingletonScope();

    // Bind contributions
    bindViewContribution(bind, RegisterViewerContribution);
    bind(FrontendApplicationContribution).toService(RegisterViewerContribution);
});
