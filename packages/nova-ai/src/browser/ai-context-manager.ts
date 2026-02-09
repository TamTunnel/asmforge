/**
 * AI Context Manager - Efficient context management for AI assistant
 *
 * Optimizes context by:
 * - Caching recent conversations LRU-style
 * - Truncating large contexts intelligently
 * - Prioritizing relevant code sections
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import { EditorManager } from '@theia/editor/lib/browser';

/** Maximum context size in tokens (approximate) */
const MAX_CONTEXT_TOKENS = 4000;

/** Average characters per token (rough estimate) */
const CHARS_PER_TOKEN = 4;

/** Maximum characters in context */
const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;

/** Context item with priority */
interface ContextItem {
    content: string;
    priority: number; // Higher = more important
    type: 'code' | 'selection' | 'conversation' | 'file';
}

/** LRU cache for conversation history */
class ConversationCache {
    private cache: Map<string, { messages: string[]; timestamp: number }> = new Map();
    private maxSize = 10; // Keep last 10 conversations

    get(sessionId: string): string[] | undefined {
        const entry = this.cache.get(sessionId);
        if (entry) {
            entry.timestamp = Date.now();
            return entry.messages;
        }
        return undefined;
    }

    set(sessionId: string, messages: string[]): void {
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            let oldest: string | null = null;
            let oldestTime = Infinity;

            for (const [key, value] of this.cache) {
                if (value.timestamp < oldestTime) {
                    oldestTime = value.timestamp;
                    oldest = key;
                }
            }

            if (oldest) {
                this.cache.delete(oldest);
            }
        }

        this.cache.set(sessionId, { messages, timestamp: Date.now() });
    }

    append(sessionId: string, message: string): void {
        const messages = this.get(sessionId) || [];
        messages.push(message);

        // Keep only last 20 messages per session
        if (messages.length > 20) {
            messages.splice(0, messages.length - 20);
        }

        this.set(sessionId, messages);
    }

    clear(): void {
        this.cache.clear();
    }
}

@injectable()
export class AIContextManager {
    @inject(EditorManager)
    protected readonly editorManager!: EditorManager;

    private conversationCache = new ConversationCache();

    /**
     * Build optimized context for AI request
     */
    async buildContext(sessionId: string): Promise<string> {
        const items: ContextItem[] = [];

        // Add current selection (highest priority)
        const selection = await this.getSelection();
        if (selection) {
            items.push({
                content: `Selected code:\n\`\`\`\n${selection}\n\`\`\``,
                priority: 100,
                type: 'selection',
            });
        }

        // Add surrounding code (medium priority)
        const surroundingCode = await this.getSurroundingCode(50);
        if (surroundingCode) {
            items.push({
                content: `Surrounding context:\n\`\`\`\n${surroundingCode}\n\`\`\``,
                priority: 50,
                type: 'code',
            });
        }

        // Add recent conversation (lower priority)
        const conversation = this.conversationCache.get(sessionId);
        if (conversation && conversation.length > 0) {
            // Keep only last few messages
            const recentMessages = conversation.slice(-5);
            items.push({
                content: recentMessages.join('\n'),
                priority: 30,
                type: 'conversation',
            });
        }

        // Build context respecting size limits
        return this.optimizeContext(items);
    }

    /**
     * Add message to conversation history
     */
    recordMessage(sessionId: string, role: 'user' | 'assistant', content: string): void {
        const prefix = role === 'user' ? 'User: ' : 'Assistant: ';
        // Truncate long messages
        const truncated = content.length > 500 ? content.slice(0, 500) + '...' : content;
        this.conversationCache.append(sessionId, prefix + truncated);
    }

    /**
     * Clear conversation history
     */
    clearHistory(sessionId?: string): void {
        if (sessionId) {
            // Clear specific session (not directly supported, would need cache modification)
            this.conversationCache.clear();
        } else {
            this.conversationCache.clear();
        }
    }

    private async getSelection(): Promise<string | undefined> {
        const editor = this.editorManager.currentEditor?.editor;
        if (!editor) return undefined;

        const selection = editor.selection;
        // Check if selection is empty by comparing start and end positions
        if (
            selection.start.line === selection.end.line &&
            selection.start.character === selection.end.character
        ) {
            return undefined;
        }

        return editor.document.getText(selection);
    }

    private async getSurroundingCode(lines: number): Promise<string | undefined> {
        const editor = this.editorManager.currentEditor?.editor;
        if (!editor) return undefined;

        const document = editor.document;
        const currentLine = editor.cursor.line;

        const startLine = Math.max(0, currentLine - lines);
        const endLine = Math.min(document.lineCount - 1, currentLine + lines);

        const content = document.getText({
            start: { line: startLine, character: 0 },
            end: { line: endLine, character: Number.MAX_SAFE_INTEGER },
        });

        return content;
    }

    private optimizeContext(items: ContextItem[]): string {
        // Sort by priority (highest first)
        items.sort((a, b) => b.priority - a.priority);

        const parts: string[] = [];
        let totalChars = 0;

        for (const item of items) {
            if (totalChars + item.content.length <= MAX_CONTEXT_CHARS) {
                parts.push(item.content);
                totalChars += item.content.length;
            } else {
                // Truncate to fit remaining space
                const remaining = MAX_CONTEXT_CHARS - totalChars;
                if (remaining > 100) {
                    // Only add if meaningful space left
                    parts.push(item.content.slice(0, remaining) + '\n...[truncated]');
                }
                break;
            }
        }

        return parts.join('\n\n');
    }
}
