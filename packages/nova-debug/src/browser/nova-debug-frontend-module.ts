/**
 * NOVA Debug - Frontend Module
 */

import { ContainerModule } from "@theia/core/shared/inversify";

export default new ContainerModule((_bind) => {
  console.log("NOVA Debug frontend module loaded");
});
