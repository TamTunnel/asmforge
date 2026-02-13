/**
 * Toolchain - Diagnostic Provider
 * Converts assembler errors to IDE diagnostics with underlines
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import { ProblemManager } from '@theia/markers/lib/browser/problem/problem-manager';
import { AssemblerDiagnostic, DiagnosticSeverity } from '../common/toolchain-types';
import URI from '@theia/core/lib/common/uri';

/** Marker data for the problem manager */
interface MarkerData {
    range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
    message: string;
    severity: number;
    source: string;
    code?: string;
}

/** Monaco severity enum values */
const SeverityMap = {
    Error: 1,
    Warning: 2,
    Information: 3,
    Hint: 4,
};

export const ToolchainDiagnosticProvider = Symbol('ToolchainDiagnosticProvider');

export interface ToolchainDiagnosticProvider {
    /** Set diagnostics for a file */
    setDiagnostics(fileUri: string, diagnostics: AssemblerDiagnostic[]): void;

    /** Clear diagnostics for a file */
    clearDiagnostics(fileUri: string): void;

    /** Clear all diagnostics */
    clearAll(): void;
}

@injectable()
export class ToolchainDiagnosticProviderImpl implements ToolchainDiagnosticProvider {
    private static readonly OWNER = 'asmforge-toolchain';

    @inject(ProblemManager)
    protected readonly problemManager!: ProblemManager;

    setDiagnostics(fileUri: string, diagnostics: AssemblerDiagnostic[]): void {
        const uri = new URI(fileUri);

        // Convert to marker format
        const markers = diagnostics.map((d) => this.convertDiagnostic(d));

        // Set markers
        this.problemManager.setMarkers(uri, ToolchainDiagnosticProviderImpl.OWNER, markers as any);
    }

    clearDiagnostics(fileUri: string): void {
        const uri = new URI(fileUri);
        this.problemManager.setMarkers(uri, ToolchainDiagnosticProviderImpl.OWNER, []);
    }

    clearAll(): void {
        // Note: ProblemManager doesn't have a clear all by owner method
        // This would need to track all files we've set markers on
    }

    private convertDiagnostic(diag: AssemblerDiagnostic): MarkerData {
        return {
            range: {
                start: {
                    line: Math.max(0, diag.line - 1),
                    character: diag.column ? diag.column - 1 : 0,
                },
                end: {
                    line: Math.max(0, diag.line - 1),
                    character: diag.column ? diag.column + 20 : 1000,
                },
            },
            message: diag.message,
            severity: this.convertSeverity(diag.severity),
            source: `${diag.source.toUpperCase()}${diag.code ? ` [${diag.code}]` : ''}`,
            code: diag.code,
        };
    }

    private convertSeverity(severity: DiagnosticSeverity): number {
        switch (severity) {
            case 'error':
                return SeverityMap.Error;
            case 'warning':
                return SeverityMap.Warning;
            case 'info':
                return SeverityMap.Information;
            case 'hint':
                return SeverityMap.Hint;
        }
    }
}
