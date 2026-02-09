/**
 * Memory Viewer - Main Widget
 * Professional hex editor with virtual scrolling
 */

import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core/lib/common';
import { MemoryService } from './memory-service';
import { MemoryRegion } from '../common/memory-types';
import { HexRow } from './components/hex-row';
import { DataInterpretPanel } from './components/data-interpret';
import '../../src/browser/style/memory-viewer.css';

export const MEMORY_VIEWER_ID = 'memory-viewer-widget';

@injectable()
export class MemoryViewerWidget extends ReactWidget {
    static readonly ID = MEMORY_VIEWER_ID;
    static readonly LABEL = 'Memory';

    @inject(MemoryService)
    protected readonly memoryService!: MemoryService;

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    private addressInputValue = '';
    private selectedAddress: bigint | undefined;
    private visibleRowCount = 20;
    private updateKey = 0;

    @postConstruct()
    protected init(): void {
        this.id = MemoryViewerWidget.ID;
        this.title.label = MemoryViewerWidget.LABEL;
        this.title.caption = 'Memory Inspection';
        this.title.iconClass = 'codicon codicon-symbol-namespace';
        this.title.closable = true;
        this.addClass('memory-viewer-widget');

        // Subscribe to updates
        this.toDispose.push(
            this.memoryService.onAddressChange(() => {
                this.updateKey++;
                this.update();
            })
        );
        this.toDispose.push(
            this.memoryService.onMemoryUpdate(() => {
                this.updateKey++;
                this.update();
            })
        );

        // Initial address
        this.addressInputValue = '0x' + this.memoryService.currentAddress.toString(16);

        this.update();
    }

    protected render(): React.ReactNode {
        return (
            <MemoryViewerComponent
                memoryService={this.memoryService}
                addressInputValue={this.addressInputValue}
                selectedAddress={this.selectedAddress}
                visibleRowCount={this.visibleRowCount}
                onAddressInputChange={this.handleAddressInputChange}
                onJumpToAddress={this.handleJumpToAddress}
                onByteSelect={this.handleByteSelect}
                onRefresh={this.handleRefresh}
                onSimulate={this.handleSimulate}
                onFollowPointer={this.handleFollowPointer}
                updateKey={this.updateKey}
            />
        );
    }

    private handleAddressInputChange = (value: string): void => {
        this.addressInputValue = value;
        this.update();
    };

    private handleJumpToAddress = (): void => {
        try {
            const address = BigInt(this.addressInputValue);
            this.memoryService.jumpToAddress(address);
            this.selectedAddress = address;
        } catch {
            this.messageService.warn('Invalid address format. Use hex (0x...) or decimal.');
        }
    };

    private handleByteSelect = (address: bigint): void => {
        this.selectedAddress = address;
        this.update();
    };

    private handleRefresh = (): void => {
        this.memoryService.refresh();
    };

    private handleSimulate = (): void => {
        this.memoryService.simulateChange();
    };

    private handleFollowPointer = (): void => {
        if (this.selectedAddress !== undefined) {
            const interp = this.memoryService.interpretData(this.selectedAddress, 'pointer');
            try {
                const targetAddress = BigInt(interp.value);
                this.memoryService.jumpToAddress(targetAddress);
                this.addressInputValue = interp.value;
                this.selectedAddress = targetAddress;
            } catch {
                this.messageService.warn('Cannot follow pointer: invalid address');
            }
        }
    };
}

// Pure component
interface MemoryViewerComponentProps {
    memoryService: MemoryService;
    addressInputValue: string;
    selectedAddress?: bigint;
    visibleRowCount: number;
    onAddressInputChange: (value: string) => void;
    onJumpToAddress: () => void;
    onByteSelect: (address: bigint) => void;
    onRefresh: () => void;
    onSimulate: () => void;
    onFollowPointer: () => void;
    updateKey: number;
}

const MemoryViewerComponent: React.FC<MemoryViewerComponentProps> = ({
    memoryService,
    addressInputValue,
    selectedAddress,
    visibleRowCount,
    onAddressInputChange,
    onJumpToAddress,
    onByteSelect,
    onRefresh,
    onSimulate,
    onFollowPointer,
}) => {
    const currentAddress = memoryService.currentAddress;
    const rows = memoryService.getMemoryRows(currentAddress, visibleRowCount);
    const stackFrame = memoryService.stackFrame;

    // Determine current region
    const currentRegion: MemoryRegion = rows[0]?.bytes[0]?.region ?? 'unknown';

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onJumpToAddress();
        }
    };

    // Handle scroll for virtual scrolling (placeholder for future implementation)
    const handleScroll = (_e: React.UIEvent<HTMLDivElement>) => {
        // Future: implement address jumping based on scroll position
    };

    // Handle address click (copy to clipboard)
    const handleAddressCopy = (address: bigint) => {
        const text = '0x' + address.toString(16);
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="memory-viewer">
            {/* Toolbar */}
            <div className="memory-toolbar">
                <div className="memory-toolbar-group">
                    <label>Address:</label>
                    <input
                        type="text"
                        value={addressInputValue}
                        onChange={(e) => onAddressInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="0x7FFFFFFFDE00"
                    />
                    <button className="primary" onClick={onJumpToAddress}>
                        Go
                    </button>
                </div>

                <div className="memory-toolbar-group">
                    <button onClick={onRefresh} title="Refresh memory">
                        ⟳ Refresh
                    </button>
                    <button onClick={onSimulate} title="Simulate changes">
                        ⚡ Simulate
                    </button>
                    {selectedAddress !== undefined && (
                        <button
                            onClick={onFollowPointer}
                            title="Follow pointer at selected address"
                        >
                            → Follow
                        </button>
                    )}
                </div>

                <div className="region-indicator">
                    <span className={`region-badge ${currentRegion}`}>{currentRegion}</span>
                    {stackFrame && (
                        <span style={{ color: '#8b5cf6', fontSize: '10px' }}>
                            SP: 0x{stackFrame.stackPointer.toString(16).slice(-8)}
                        </span>
                    )}
                </div>
            </div>

            {/* Hex view with virtual scrolling */}
            <div className="memory-hex-view" onScroll={handleScroll}>
                <div className="memory-virtual-container">
                    {rows.map((row) => (
                        <HexRow
                            key={row.address.toString()}
                            row={row}
                            stackFrame={stackFrame}
                            onByteClick={onByteSelect}
                            onAddressClick={handleAddressCopy}
                            selectedAddress={selectedAddress}
                        />
                    ))}
                </div>
            </div>

            {/* Data interpretation panel */}
            {selectedAddress !== undefined && (
                <DataInterpretPanel memoryService={memoryService} address={selectedAddress} />
            )}

            {/* Status bar */}
            <div className="memory-status-bar">
                <div className="status-left">
                    <div className="status-item">
                        <span className="label">Base:</span>
                        <span>0x{currentAddress.toString(16).toUpperCase()}</span>
                    </div>
                    <div className="status-item">
                        <span className="label">Selected:</span>
                        <span>
                            {selectedAddress !== undefined
                                ? '0x' + selectedAddress.toString(16).toUpperCase()
                                : 'None'}
                        </span>
                    </div>
                    <div className="status-item">
                        <span className="label">Endian:</span>
                        <span>Little</span>
                    </div>
                </div>
                <div className="status-right">
                    <span>{visibleRowCount * 16} bytes displayed</span>
                </div>
            </div>
        </div>
    );
};
