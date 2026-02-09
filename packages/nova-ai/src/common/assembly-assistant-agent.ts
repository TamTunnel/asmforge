/**
 * Assembly Assistant - Chat Agent
 *
 * AI-powered chat agent for assembly language development.
 * Provides code explanation, optimization suggestions, bug detection,
 * and architecture conversion capabilities.
 */

import { injectable } from '@theia/core/shared/inversify';
import {
    AbstractStreamParsingChatAgent,
    SystemMessageDescription,
} from '@theia/ai-chat/lib/common/chat-agents';
import { LanguageModelRequirement, AIVariableContext } from '@theia/ai-core';
import { assemblyAssistantPromptTemplate, allPromptTemplates } from './assembly-prompt-template';

/**
 * Assembly Assistant Chat Agent
 *
 * A specialized AI agent for assembly language programming assistance.
 * Supports x86/x86-64, ARM/AArch64, and RISC-V architectures.
 */
@injectable()
export class AssemblyAssistantAgent extends AbstractStreamParsingChatAgent {
    // Agent identification
    readonly id: string = 'AssemblyAssistant';
    readonly name: string = 'Assembly Assistant';
    readonly description: string =
        'Expert assembly language assistant for x86, ARM, and RISC-V. ' +
        'Provides code explanation, optimization suggestions, bug detection, ' +
        'and cross-architecture conversion.';

    // Icon for the chat UI (using a CPU-like icon)
    override iconClass: string = 'codicon codicon-symbol-operator';

    // Language model requirements - uses Gemini Pro via default/universal
    readonly languageModelRequirements: LanguageModelRequirement[] = [
        {
            purpose: 'chat',
            identifier: 'google/gemini-2.0-flash',
        },
        {
            purpose: 'chat',
            identifier: 'default/universal',
        },
    ];

    protected defaultLanguageModelPurpose: string = 'chat';

    // Register all prompt fragments
    override prompts = allPromptTemplates.map((fragment) => ({
        id: fragment.id,
        defaultVariant: fragment,
    }));

    // System prompt ID
    protected override systemPromptId: string = assemblyAssistantPromptTemplate.id;

    // Agent-specific variables available in prompts
    override agentSpecificVariables = [
        {
            name: 'activeFileContent',
            description: 'Content of the currently active editor file',
            usedInPrompt: true,
        },
        {
            name: 'selectedCode',
            description: 'Currently selected code in the editor',
            usedInPrompt: true,
        },
        {
            name: 'architecturePreference',
            description: "User's preferred assembly architecture (x86, ARM, RISC-V)",
            usedInPrompt: true,
        },
        {
            name: 'fileName',
            description: 'Name of the current file',
            usedInPrompt: true,
        },
    ];

    // Tool functions this agent can use
    override functions = [
        'getActiveFileContent',
        'getSelectedCode',
        'insertCodeAtCursor',
        'replaceSelection',
    ];

    // Tags for categorizing this agent
    override readonly tags: string[] = [
        'assembly',
        'x86',
        'arm',
        'riscv',
        'programming',
        'low-level',
    ];

    /**
     * Get the system message description for the agent.
     * Resolves variables and returns the formatted system prompt.
     */
    protected override async getSystemMessageDescription(
        context: AIVariableContext
    ): Promise<SystemMessageDescription | undefined> {
        // Resolve the system prompt with context variables
        const resolvedPrompt = await this.promptService.getResolvedPromptFragment(
            assemblyAssistantPromptTemplate.id,
            {
                // Default values if variables aren't available
                activeFileContent: '(No file open)',
                selectedCode: '(No selection)',
                architecturePreference: 'x86-64',
            },
            context
        );

        if (resolvedPrompt === undefined) {
            console.error('Failed to resolve Assembly Assistant system prompt');
            return undefined;
        }

        return SystemMessageDescription.fromResolvedPromptFragment(resolvedPrompt);
    }
}
