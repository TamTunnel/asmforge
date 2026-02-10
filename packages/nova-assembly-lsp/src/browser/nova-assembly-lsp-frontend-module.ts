/**
 * NOVA Assembly LSP - Frontend Module
 *
 * Registers the Assembly language with Monaco editor and connects to LSP.
 */

import { ContainerModule } from "@theia/core/shared/inversify";

export default new ContainerModule((_bind) => {
  // Language registration will be added here
  console.log("NOVA Assembly LSP frontend module loaded");
});
