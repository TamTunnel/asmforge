/**
 * NOVA AI - Frontend Module
 *
 * Provides AI-powered assistance for assembly programming:
 * - Code explanation
 * - Optimization suggestions
 * - Bug detection
 * - Documentation lookup
 */

import { ContainerModule } from "@theia/core/shared/inversify";

export default new ContainerModule((bind) => {
  console.log("NOVA AI frontend module loaded");
  // AI chat widget and commands will be registered here
});
