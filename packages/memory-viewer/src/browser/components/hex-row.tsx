/**
 * Memory Viewer - Hex Row Component
 * Single row of 16 bytes with address, hex dump, and ASCII
 */

import * as React from 'react';
import { MemoryRow, StackFrameInfo } from '../../common/memory-types';

interface HexRowProps {
    row: MemoryRow;
    stackFrame?: StackFrameInfo;
    onByteClick?: (address: bigint) => void;
    onAddressClick?: (address: bigint) => void;
    selectedAddress?: bigint;
}

/** Check if byte is printable ASCII */
function isPrintable(byte: number): boolean {
    return byte >= 32 && byte < 127;
}

/** Format address as hex */
function formatAddress(address: bigint): string {
    return '0x' + address.toString(16).toUpperCase().padStart(12, '0');
}

/** Format byte as hex */
function formatByte(byte: number): string {
    return byte.toString(16).toUpperCase().padStart(2, '0');
}

/** Check if address is within stack frame */
function isInStackFrame(address: bigint, frame?: StackFrameInfo): boolean {
    if (!frame) return false;
    return address >= frame.stackPointer && address <= frame.framePointer + BigInt(8);
}

export const HexRow: React.FC<HexRowProps> = ({
    row,
    stackFrame,
    onByteClick,
    onAddressClick,
    selectedAddress,
}) => {
    const inStackFrame = isInStackFrame(row.address, stackFrame);
    const hasBreakpoint = row.bytes.some((b) => b.isBreakpoint);

    const rowClasses = [
        'memory-row',
        inStackFrame ? 'in-stack-frame' : '',
        hasBreakpoint ? 'has-breakpoint' : '',
    ]
        .filter(Boolean)
        .join(' ');

    // Build ASCII representation
    const ascii = row.bytes.map((b) => {
        if (isPrintable(b.value)) {
            return (
                <span
                    key={b.address.toString()}
                    className={`printable ${b.isModified ? 'modified' : ''}`}
                >
                    {String.fromCharCode(b.value)}
                </span>
            );
        }
        return (
            <span key={b.address.toString()} className="non-printable">
                .
            </span>
        );
    });

    return (
        <div className={rowClasses}>
            <span
                className="memory-address"
                onClick={() => onAddressClick?.(row.address)}
                title="Click to copy address"
            >
                {formatAddress(row.address)}
            </span>

            <div className="memory-hex">
                {row.bytes.map((byte, idx) => {
                    const isSelected =
                        selectedAddress !== undefined && byte.address === selectedAddress;

                    // Check if byte looks like part of a pointer
                    const isPointerByte = byte.value >= 0x55 && byte.value <= 0x7f;

                    const byteClasses = [
                        'memory-byte',
                        byte.isModified ? 'modified' : '',
                        byte.isBreakpoint ? 'breakpoint' : '',
                        isSelected ? 'selected' : '',
                        byte.value === 0 ? 'zero' : '',
                        isPointerByte ? 'pointer' : '',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <React.Fragment key={byte.address.toString()}>
                            {idx === 8 && <span className="byte-sep" />}
                            <span
                                className={byteClasses}
                                onClick={() => onByteClick?.(byte.address)}
                                title={`Address: ${formatAddress(byte.address)}\nValue: ${byte.value} (0x${formatByte(byte.value)})`}
                            >
                                {formatByte(byte.value)}
                            </span>
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="memory-ascii">{ascii}</div>
        </div>
    );
};
