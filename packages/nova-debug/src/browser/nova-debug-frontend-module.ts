/**
 * NOVA Debug - Frontend Module
 */

import { ContainerModule } from "@theia/core/shared/inversify";

export default new ContainerModule((bind) => {
  console.log("NOVA Debug frontend module loaded");
});
