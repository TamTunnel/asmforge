/**
 * NOVA Debug - Backend Module
 */

import { ContainerModule } from "@theia/core/shared/inversify";

export default new ContainerModule((_bind) => {
  console.log("NOVA Debug backend module loaded");
});
