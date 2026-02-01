/**
 * NOVA AI - Backend Module
 *
 * Manages AI service connections and MCP server integration.
 */

import { ContainerModule } from "@theia/core/shared/inversify";

export default new ContainerModule((bind) => {
  console.log("NOVA AI backend module loaded");
  // MCP server and AI service connections will be configured here
});
