/**
 * NOVA Assembly IDE - Core Frontend Module
 *
 * This module wires the core NOVA components into the Theia application.
 * It provides:
 * - Welcome view
 * - Status bar contributions
 * - Custom commands
 * - Theme contributions
 */

import { ContainerModule } from "@theia/core/shared/inversify";
import { FrontendApplicationContribution } from "@theia/core/lib/browser";
import { NovaWelcomeContribution } from "./nova-welcome-contribution";

export default new ContainerModule((bind) => {
  // Register the welcome contribution
  bind(NovaWelcomeContribution).toSelf().inSingletonScope();
  bind(FrontendApplicationContribution).toService(NovaWelcomeContribution);
});
