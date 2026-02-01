/**
 * NOVA Welcome Contribution
 *
 * Handles initialization and welcome screen for NOVA Assembly IDE.
 */

import { injectable, postConstruct } from "@theia/core/shared/inversify";
import {
  FrontendApplicationContribution,
  FrontendApplication,
} from "@theia/core/lib/browser";

@injectable()
export class NovaWelcomeContribution implements FrontendApplicationContribution {
  @postConstruct()
  protected init(): void {
    console.log("NOVA Assembly IDE initialized");
  }

  async onStart(app: FrontendApplication): Promise<void> {
    console.log("🚀 NOVA Assembly IDE - Neural Optimization Virtual Assistant");
    console.log("   Supported architectures: x86, x64, ARM, AArch64, RISC-V");
    console.log("   Assemblers: NASM, GAS, MASM, FASM");
  }
}
