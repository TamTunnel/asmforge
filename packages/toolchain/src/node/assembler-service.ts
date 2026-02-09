/**
 * Toolchain - Assembler Service (Backend)
 * Executes assemblers and parses output
 */

import { injectable } from '@theia/core/shared/inversify';
import { spawn } from 'child_process';
import * as path from 'path';
import {
    AssemblerType,
    BuildConfig,
    BuildResult,
    ASSEMBLER_FORMAT_FLAGS,
    DEFAULT_ASSEMBLER_CONFIGS,
} from '../common/toolchain-types';
import { parseAssemblerOutput } from '../common/error-parser';

export const AssemblerService = Symbol('AssemblerService');

export interface AssemblerService {
    /** Check if assembler is available */
    checkAssembler(
        type: AssemblerType
    ): Promise<{ available: boolean; version?: string; path?: string }>;

    /** Assemble a file */
    assemble(config: BuildConfig): Promise<BuildResult>;

    /** Link object files */
    link(objectFiles: string[], outputFile: string, flags: string[]): Promise<BuildResult>;

    /** Get assembler version */
    getVersion(type: AssemblerType): Promise<string>;
}

@injectable()
export class AssemblerServiceImpl implements AssemblerService {
    async checkAssembler(
        type: AssemblerType
    ): Promise<{ available: boolean; version?: string; path?: string }> {
        const defaultConfig = DEFAULT_ASSEMBLER_CONFIGS[type];
        const executable = defaultConfig.executable || type;

        try {
            const result = await this.runCommand(executable, ['--version']);
            const version = this.extractVersion(result.stdout);
            return { available: true, version, path: executable };
        } catch {
            return { available: false };
        }
    }

    async getVersion(type: AssemblerType): Promise<string> {
        const check = await this.checkAssembler(type);
        return check.version || 'unknown';
    }

    async assemble(config: BuildConfig): Promise<BuildResult> {
        const startTime = Date.now();
        const assemblerConfig = config.assembler;

        // Build command arguments
        const args = this.buildAssemblerArgs(config);

        // Determine output file
        const sourceDir = path.dirname(config.sourceFile);
        const baseName = path.basename(config.sourceFile, path.extname(config.sourceFile));
        const outputFile = config.outputFile || path.join(sourceDir, `${baseName}.o`);

        // Add output argument
        args.push(...this.getOutputArgs(assemblerConfig.type, outputFile));

        // Add source file
        args.push(config.sourceFile);

        try {
            const result = await this.runCommand(assemblerConfig.executable, args);
            const duration = Date.now() - startTime;

            // Parse diagnostics from stderr (most assemblers write errors there)
            const combinedOutput = result.stderr + '\n' + result.stdout;
            const diagnostics = parseAssemblerOutput(
                combinedOutput,
                assemblerConfig.type,
                config.sourceFile
            );

            const hasErrors = diagnostics.some((d) => d.severity === 'error');

            return {
                success: result.exitCode === 0 && !hasErrors,
                exitCode: result.exitCode,
                outputFile: result.exitCode === 0 ? outputFile : undefined,
                listingFile: config.generateListing ? `${baseName}.lst` : undefined,
                diagnostics,
                stdout: result.stdout,
                stderr: result.stderr,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            const message = error instanceof Error ? error.message : String(error);

            return {
                success: false,
                exitCode: -1,
                diagnostics: [
                    {
                        file: config.sourceFile,
                        line: 1,
                        message: `Failed to run assembler: ${message}`,
                        severity: 'error',
                        source: assemblerConfig.type,
                        rawText: message,
                    },
                ],
                stdout: '',
                stderr: message,
                duration,
            };
        }
    }

    async link(objectFiles: string[], outputFile: string, flags: string[]): Promise<BuildResult> {
        const startTime = Date.now();

        // Use ld or gcc for linking
        const linker = 'gcc'; // More portable than raw ld
        const args = ['-o', outputFile, ...flags, ...objectFiles];

        try {
            const result = await this.runCommand(linker, args);
            const duration = Date.now() - startTime;

            // Parse linker errors
            const diagnostics = parseAssemblerOutput(result.stderr, 'gas', objectFiles[0] || '');

            return {
                success: result.exitCode === 0,
                exitCode: result.exitCode,
                outputFile: result.exitCode === 0 ? outputFile : undefined,
                diagnostics,
                stdout: result.stdout,
                stderr: result.stderr,
                duration,
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            const message = error instanceof Error ? error.message : String(error);

            return {
                success: false,
                exitCode: -1,
                diagnostics: [
                    {
                        file: objectFiles[0] || '',
                        line: 1,
                        message: `Linker failed: ${message}`,
                        severity: 'error',
                        source: 'gas',
                        rawText: message,
                    },
                ],
                stdout: '',
                stderr: message,
                duration,
            };
        }
    }

    private buildAssemblerArgs(config: BuildConfig): string[] {
        const assembler = config.assembler;
        const args: string[] = [];

        // Format flags
        const formatFlags = ASSEMBLER_FORMAT_FLAGS[assembler.type]?.[assembler.outputFormat] || [];
        args.push(...formatFlags);

        // Include paths
        for (const includePath of assembler.includePaths) {
            args.push('-I', includePath);
        }

        // Defines
        for (const [key, value] of Object.entries(assembler.defines)) {
            if (assembler.type === 'nasm') {
                args.push('-D', value ? `${key}=${value}` : key);
            } else {
                args.push(`--defsym=${key}=${value || '1'}`);
            }
        }

        // Additional flags
        args.push(...assembler.additionalFlags);

        // Listing file
        if (config.generateListing) {
            const baseName = path.basename(config.sourceFile, path.extname(config.sourceFile));
            if (assembler.type === 'nasm') {
                args.push('-l', `${baseName}.lst`);
            } else if (assembler.type === 'gas') {
                args.push('-al=' + `${baseName}.lst`);
            }
        }

        return args;
    }

    private getOutputArgs(type: AssemblerType, outputFile: string): string[] {
        switch (type) {
            case 'nasm':
                return ['-o', outputFile];
            case 'gas':
                return ['-o', outputFile];
            case 'llvm':
                return ['-o', outputFile];
            case 'armasm':
                return ['-o', outputFile];
        }
    }

    private async runCommand(
        command: string,
        args: string[]
    ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                shell: false,
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data: Buffer) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data: Buffer) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                resolve({ stdout, stderr, exitCode: code ?? 1 });
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    private extractVersion(output: string): string {
        // Try to extract version number from common patterns
        const patterns = [
            /version\s+(\d+\.\d+(?:\.\d+)?)/i,
            /(\d+\.\d+(?:\.\d+)?)/,
            /v(\d+\.\d+(?:\.\d+)?)/i,
        ];

        for (const pattern of patterns) {
            const match = output.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return output.split('\n')[0].trim().slice(0, 50);
    }
}
