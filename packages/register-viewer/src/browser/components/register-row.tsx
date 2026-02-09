/**
 * Register Viewer - Single Register Row Component
 */

import * as React from 'react';
import { RegisterValue, ValueFormat, ValueClassification } from '../../common/register-types';

interface RegisterRowProps {
    register: RegisterValue;
    format: ValueFormat;
}

/**
 * Format a BigInt value according to the specified format
 */
function formatValue(value: bigint, size: number, format: ValueFormat): string {
    switch (format) {
        case 'hex':
            return formatHex(value, size);
        case 'dec':
            return formatDec(value, size);
        case 'bin':
            return formatBin(value, size);
        default:
            return formatHex(value, size);
    }
}

function formatHex(value: bigint, size: number): string {
    const hexDigits = Math.ceil(size / 4);
    const hex = value.toString(16).toUpperCase().padStart(hexDigits, '0');

    // Add spacing every 4 characters for readability
    if (size <= 64) {
        return '0x' + hex;
    }

    // For SIMD registers, format in chunks
    const chunks: string[] = [];
    for (let i = 0; i < hex.length; i += 8) {
        chunks.push(hex.slice(i, i + 8));
    }
    return chunks.join(' ');
}

function formatDec(value: bigint, size: number): string {
    // For signed representation, check MSB
    const signBit = BigInt(1) << BigInt(size - 1);
    if (value >= signBit) {
        // Negative in signed representation
        const mask = (BigInt(1) << BigInt(size)) - BigInt(1);
        const signedValue = value - (mask + BigInt(1));
        return signedValue.toString();
    }
    return value.toString();
}

function formatBin(value: bigint, size: number): string {
    const bin = value.toString(2).padStart(size, '0');

    // For large registers, only show first/last bits with ellipsis
    if (size > 64) {
        return bin.slice(0, 32) + '...' + bin.slice(-32);
    }

    // Group into bytes with separators
    const bytes: string[] = [];
    for (let i = 0; i < bin.length; i += 8) {
        bytes.push(bin.slice(i, i + 8));
    }
    return bytes.join(' ');
}

/**
 * Classify a value for color coding
 */
function classifyValue(register: RegisterValue): ValueClassification {
    const { value, changed, register: def } = register;

    if (changed) {
        return 'changed';
    }

    if (value === BigInt(0)) {
        return 'zero';
    }

    // Check for pointer-like names
    const name = def.name.toUpperCase();
    if (name.includes('SP') || name.includes('BP') || name.includes('FP')) {
        return 'pointer';
    }

    // Check for negative (MSB set) - only for general registers
    if (def.group === 'general' || def.group === 'special') {
        const signBit = BigInt(1) << BigInt(def.size - 1);
        if (value >= signBit && def.size <= 64) {
            // Check if it looks like an address (high bits 0x7F or higher)
            if (value >= BigInt('0x7F0000000000') && value <= BigInt('0xFFFFFFFFFFFF')) {
                return 'address';
            }
            return 'negative';
        }
    }

    // Check for address-like values
    if (def.size === 64 && value >= BigInt('0x100000') && value <= BigInt('0x7FFFFFFFFFFF')) {
        return 'address';
    }

    return 'neutral';
}

export const RegisterRow: React.FC<RegisterRowProps> = ({ register, format }) => {
    const { register: def, value, changed } = register;

    const formattedValue = formatValue(value, def.size, format);
    const classification = classifyValue(register);

    const valueClasses = ['register-value', classification];
    if (format === 'bin') {
        valueClasses.push('binary');
    }
    if (def.group === 'simd' || def.size > 64) {
        valueClasses.push('simd');
    }

    const tooltip =
        def.description + (def.aliases?.length ? ` (aliases: ${def.aliases.join(', ')})` : '');

    return (
        <div className={`register-row ${changed ? 'changed' : ''}`} title={tooltip}>
            <span className="register-name">{def.name}</span>
            <span className={valueClasses.join(' ')}>{formattedValue}</span>
        </div>
    );
};
