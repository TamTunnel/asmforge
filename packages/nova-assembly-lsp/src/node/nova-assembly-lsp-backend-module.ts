/**
 * NOVA Assembly LSP - Backend Module
 *
 * Manages the asm-lsp server process and LSP connection.
 */

import { ContainerModule } from "@theia/core/shared/inversify";

export default new ContainerModule((bind) => {
  // LSP server connection will be configured here
  console.log("NOVA Assembly LSP backend module loaded");
});
