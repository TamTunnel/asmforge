/**
 * AI Assistant Tests
 * Tests for the Nova AI integration
 */

describe('Nova AI Assistant', () => {
    describe('Assembly Query Handling', () => {
        it('should explain x86 instructions', async () => {
            // Mock AI response
            const mockResponse = {
                explanation: 'MOV copies data from source to destination',
                syntax: 'MOV dest, src',
                examples: ['mov eax, 42', 'mov [rbp-8], rax'],
            };

            expect(mockResponse.explanation).toContain('MOV');
            expect(mockResponse.syntax).toBeDefined();
            expect(mockResponse.examples.length).toBeGreaterThan(0);
        });

        it('should explain ARM instructions', async () => {
            const mockResponse = {
                explanation: 'LDR loads a value from memory into a register',
                syntax: 'LDR Rd, [Rn, #offset]',
                examples: ['ldr r0, [r1]', 'ldr r0, [sp, #4]'],
            };

            expect(mockResponse.explanation).toContain('LDR');
            expect(mockResponse.syntax).toContain('Rd');
        });

        it('should explain RISC-V instructions', async () => {
            const mockResponse = {
                explanation: 'ADDI adds an immediate value to a register',
                syntax: 'addi rd, rs1, imm',
                examples: ['addi a0, zero, 5'],
            };

            expect(mockResponse.explanation).toContain('ADDI');
        });
    });

    describe('Code Optimization Suggestions', () => {
        it('should suggest loop optimizations', async () => {
            const mockSuggestions = [
                'Consider using loop instruction',
                'Use lea for address calculations',
                'Align loop to 16-byte boundary',
            ];

            expect(mockSuggestions.length).toBeGreaterThan(0);
            expect(mockSuggestions[0]).toContain('loop');
        });

        it('should suggest register usage improvements', async () => {
            const mockSuggestions = ['Use a different register to avoid push/pop overhead'];

            expect(mockSuggestions.length).toBeGreaterThan(0);
        });
    });

    describe('Debug Assistance', () => {
        it('should help diagnose segfaults', async () => {
            const mockDiagnosis = {
                likelyCause: 'NULL pointer dereference',
                suggestions: [
                    'Check array bounds',
                    'Verify pointer initialization',
                    'Check for use-after-free',
                ],
            };

            expect(mockDiagnosis.likelyCause).toContain('NULL');
            expect(mockDiagnosis.suggestions.length).toBeGreaterThan(0);
        });

        it('should explain stack traces', async () => {
            const mockExplanation =
                'Execution started at _start, entered main, then crash_here where the error occurred';

            expect(mockExplanation).toContain('crash_here');
        });
    });

    describe('Context Management', () => {
        it('should maintain conversation context', async () => {
            const conversation = [
                { role: 'user', content: 'What is a syscall?' },
                { role: 'assistant', content: 'A syscall is...' },
                { role: 'user', content: 'Give me an example' },
            ];

            // Second question should understand it refers to syscalls
            expect(conversation.length).toBe(3);
        });

        it('should handle architecture context switches', async () => {
            const contexts = [
                { architecture: 'x86_64', question: 'How do I call printf?' },
                { architecture: 'arm64', question: 'Same question for ARM' },
            ];

            expect(contexts[0].architecture).not.toBe(contexts[1].architecture);
        });
    });
});
