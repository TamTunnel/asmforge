/**
 * Register Viewer - Main Widget Component
 */

import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core/lib/common';
import { Architecture, ValueFormat, RegisterGroup } from '../common/register-types';
import { getArchitectureName } from '../common/register-data';
import { RegisterService } from './register-service';
import { RegisterGroupComponent } from './components/register-group';
import '../../src/browser/style/register-viewer.css';

/** Widget ID for Theia's layout system */
export const REGISTER_VIEWER_ID = 'register-viewer-widget';

@injectable()
export class RegisterViewerWidget extends ReactWidget {
    static readonly ID = REGISTER_VIEWER_ID;
    static readonly LABEL = 'CPU Registers';

    @inject(RegisterService)
    protected readonly registerService!: RegisterService;

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    private architecture: Architecture = 'x86-64';
    private valueFormat: ValueFormat = 'hex';
    private updateCounter = 0;

    @postConstruct()
    protected init(): void {
        this.id = RegisterViewerWidget.ID;
        this.title.label = RegisterViewerWidget.LABEL;
        this.title.caption = 'View CPU Registers';
        this.title.iconClass = 'codicon codicon-symbol-variable';
        this.title.closable = true;
        this.addClass('register-viewer-widget');

        // Subscribe to register updates
        this.toDispose.push(
            this.registerService.onRegisterUpdate(() => {
                this.updateCounter++;
                this.update();
            })
        );

        this.update();
    }

    protected render(): React.ReactNode {
        return (
            <RegisterViewerComponent
                registerService={this.registerService}
                architecture={this.architecture}
                valueFormat={this.valueFormat}
                onArchitectureChange={this.handleArchitectureChange}
                onFormatChange={this.handleFormatChange}
                onSimulateChange={this.handleSimulateChange}
                updateKey={this.updateCounter}
            />
        );
    }

    private handleArchitectureChange = (arch: Architecture): void => {
        this.architecture = arch;
        this.registerService.setArchitecture(arch);
    };

    private handleFormatChange = (format: ValueFormat): void => {
        this.valueFormat = format;
        this.update();
    };

    private handleSimulateChange = (): void => {
        this.registerService.simulateChange();
    };
}

/** Pure React component for rendering */
interface RegisterViewerComponentProps {
    registerService: RegisterService;
    architecture: Architecture;
    valueFormat: ValueFormat;
    onArchitectureChange: (arch: Architecture) => void;
    onFormatChange: (format: ValueFormat) => void;
    onSimulateChange: () => void;
    updateKey: number;
}

const RegisterViewerComponent: React.FC<RegisterViewerComponentProps> = ({
    registerService,
    architecture,
    valueFormat,
    onArchitectureChange,
    onFormatChange,
    onSimulateChange,
}) => {
    const state = registerService.getRegisterState();

    if (!state) {
        return (
            <div className="register-viewer">
                <div className="register-viewer-empty">No register data available</div>
            </div>
        );
    }

    // Define group order for display
    const groupOrder: RegisterGroup[] = ['general', 'special', 'flags', 'simd', 'float'];

    // Get groups in order
    const orderedGroups = groupOrder
        .filter((g) => state.groups.has(g))
        .map((g) => ({ group: g, registers: state.groups.get(g)! }));

    const architectures: Architecture[] = ['x86-64', 'arm64', 'riscv64'];
    const formats: ValueFormat[] = ['hex', 'dec', 'bin'];

    return (
        <div className="register-viewer">
            <div className="register-viewer-header">
                <label>Arch:</label>
                <select
                    value={architecture}
                    onChange={(e) => onArchitectureChange(e.target.value as Architecture)}
                >
                    {architectures.map((arch) => (
                        <option key={arch} value={arch}>
                            {getArchitectureName(arch)}
                        </option>
                    ))}
                </select>

                <div className="format-toggle">
                    {formats.map((fmt) => (
                        <button
                            key={fmt}
                            className={fmt === valueFormat ? 'active' : ''}
                            onClick={() => onFormatChange(fmt)}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>

                <button
                    className="simulate-btn"
                    onClick={onSimulateChange}
                    title="Simulate register changes (for testing)"
                    style={{
                        padding: '4px 8px',
                        background: 'var(--theia-button-secondaryBackground)',
                        color: 'var(--theia-button-secondaryForeground)',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '10px',
                    }}
                >
                    ⟳ Simulate
                </button>
            </div>

            <div className="register-viewer-content">
                {orderedGroups.map(({ group, registers }) => (
                    <RegisterGroupComponent
                        key={group}
                        group={group}
                        registers={registers}
                        format={valueFormat}
                        defaultCollapsed={group === 'simd' || group === 'float'}
                    />
                ))}
            </div>
        </div>
    );
};
