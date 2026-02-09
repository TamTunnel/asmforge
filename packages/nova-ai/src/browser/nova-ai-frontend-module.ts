/**
 * AsmForge AI Agent - Frontend Module
 *
 * Registers the Assembly Assistant agent and all supporting components:
 * - AssemblyAssistantAgent (Chat Agent)
 * - Tool Providers (file content, selection, code insertion)
 * - Variable Providers (context variables for prompts)
 */

import { ContainerModule } from '@theia/core/shared/inversify';
import { Agent, ToolProvider, AIVariableContribution } from '@theia/ai-core';
import { ChatAgent } from '@theia/ai-chat';

import { AssemblyAssistantAgent } from '../common/assembly-assistant-agent';
import {
    GetActiveFileContentTool,
    GetSelectedCodeTool,
    InsertCodeAtCursorTool,
    ReplaceSelectionTool,
} from './assembly-tools';
import { AssemblyContextVariables } from './assembly-variables';

export default new ContainerModule((bind) => {
    // Bind the Assembly Assistant Agent
    // Register as both Agent (generic) and ChatAgent (for chat UI)
    bind(AssemblyAssistantAgent).toSelf().inSingletonScope();
    bind(Agent).toService(AssemblyAssistantAgent);
    bind(ChatAgent).toService(AssemblyAssistantAgent);

    // Bind Tool Providers
    // These allow the LLM to interact with the editor
    bind(GetActiveFileContentTool).toSelf().inSingletonScope();
    bind(ToolProvider).toService(GetActiveFileContentTool);

    bind(GetSelectedCodeTool).toSelf().inSingletonScope();
    bind(ToolProvider).toService(GetSelectedCodeTool);

    bind(InsertCodeAtCursorTool).toSelf().inSingletonScope();
    bind(ToolProvider).toService(InsertCodeAtCursorTool);

    bind(ReplaceSelectionTool).toSelf().inSingletonScope();
    bind(ToolProvider).toService(ReplaceSelectionTool);

    // Bind Variable Providers
    // These provide context to prompts
    bind(AssemblyContextVariables).toSelf().inSingletonScope();
    bind(AIVariableContribution).toService(AssemblyContextVariables);

    console.log('AsmForge AI Agent initialized - Assembly Assistant ready');
});
