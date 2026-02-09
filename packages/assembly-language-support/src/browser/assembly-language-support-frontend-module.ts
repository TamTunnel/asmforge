/**
 * AsmForge Assembly Language Support
 *
 * Theia frontend module registering assembly languages with Monaco.
 * Provides TextMate grammars for x86, ARM, and RISC-V.
 */

import { ContainerModule, injectable } from '@theia/core/shared/inversify';
import {
    LanguageGrammarDefinitionContribution,
    TextmateRegistry,
} from '@theia/monaco/lib/browser/textmate';
import * as monaco from '@theia/monaco-editor-core';

interface AssemblyLanguage {
    id: string;
    extensions: string[];
    aliases: string[];
    scopeName: string;
    grammarPath: string;
    mimetypes?: string[];
}

const ASSEMBLY_LANGUAGES: AssemblyLanguage[] = [
    {
        id: 'asm-x86',
        extensions: ['.asm', '.nasm', '.yasm', '.masm', '.fasm'],
        aliases: ['x86 Assembly', 'NASM', 'x86', 'x64'],
        scopeName: 'source.asm.x86',
        grammarPath: '../../syntaxes/x86.tmLanguage.json',
        mimetypes: ['text/x-asm', 'text/x-nasm'],
    },
    {
        id: 'asm-arm',
        extensions: ['.arm', '.aarch64'],
        aliases: ['ARM Assembly', 'ARM', 'AArch64', 'ARM64'],
        scopeName: 'source.asm.arm',
        grammarPath: '../../syntaxes/arm.tmLanguage.json',
        mimetypes: ['text/x-arm'],
    },
    {
        id: 'asm-riscv',
        extensions: ['.riscv', '.rv', '.rv32', '.rv64'],
        aliases: ['RISC-V Assembly', 'RISC-V', 'RV32', 'RV64'],
        scopeName: 'source.asm.riscv',
        grammarPath: '../../syntaxes/riscv.tmLanguage.json',
        mimetypes: ['text/x-riscv'],
    },
    // GAS-style assembly (shared extensions .s and .S for ARM/generic)
    {
        id: 'asm-gas',
        extensions: ['.s', '.S'],
        aliases: ['GNU Assembly', 'GAS', 'AT&T Assembly'],
        scopeName: 'source.asm.arm',
        grammarPath: '../../syntaxes/arm.tmLanguage.json',
        mimetypes: ['text/x-gas'],
    },
];

@injectable()
export class AssemblyGrammarContribution implements LanguageGrammarDefinitionContribution {
    registerTextmateLanguage(registry: TextmateRegistry): void {
        for (const lang of ASSEMBLY_LANGUAGES) {
            // First, register the language with Monaco
            monaco.languages.register({
                id: lang.id,
                extensions: lang.extensions,
                aliases: lang.aliases,
                mimetypes: lang.mimetypes,
            });

            // Set up language configuration for comments, brackets, etc.
            monaco.languages.setLanguageConfiguration(lang.id, {
                comments: {
                    lineComment: lang.id === 'asm-x86' ? ';' : '#',
                    blockComment: ['/*', '*/'],
                },
                brackets: [
                    ['[', ']'],
                    ['(', ')'],
                    ['{', '}'],
                ],
                autoClosingPairs: [
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '{', close: '}' },
                    { open: '"', close: '"', notIn: ['string'] },
                    { open: "'", close: "'", notIn: ['string'] },
                ],
                surroundingPairs: [
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '{', close: '}' },
                    { open: '"', close: '"' },
                    { open: "'", close: "'" },
                ],
                folding: {
                    markers: {
                        start: /^\s*(?:section\s+\.[a-z]+|\.[a-z]+:|[a-zA-Z_][a-zA-Z0-9_]*:)/,
                        end: /^\s*(?=section\s+\.[a-z]+|\.[a-z]+:|[a-zA-Z_][a-zA-Z0-9_]*:|\s*$)/,
                    },
                },
                indentationRules: {
                    increaseIndentPattern: /^\s*[a-zA-Z_][a-zA-Z0-9_]*:/,
                    decreaseIndentPattern: /^\s*(?:ret|\.end)/,
                },
            });

            // Register the grammar scope
            const grammarPath = lang.grammarPath;
            registry.registerTextmateGrammarScope(lang.scopeName, {
                async getGrammarDefinition() {
                    const grammar = await import(grammarPath);
                    return {
                        format: 'json',
                        content: grammar.default || grammar,
                    };
                },
            });

            // Map language ID to grammar scope
            registry.mapLanguageIdToTextmateGrammar(lang.id, lang.scopeName);

            // Register grammar configuration
            registry.registerGrammarConfiguration(lang.id, {
                embeddedLanguages: {},
                tokenTypes: {},
            });
        }
    }
}

export default new ContainerModule((bind) => {
    bind(LanguageGrammarDefinitionContribution).to(AssemblyGrammarContribution);
});
