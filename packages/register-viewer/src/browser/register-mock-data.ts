/**
 * Register Viewer - Mock Data for Testing
 */

import {
    Architecture,
    RegisterValue,
    RegisterGroup,
    RegisterState,
} from '../common/register-types';
import { getArchitectureRegisters } from '../common/register-data';

/**
 * Generate random register values for testing
 */
function randomValue(size: number): bigint {
    let value = BigInt(0);
    const bytes = Math.ceil(size / 8);

    for (let i = 0; i < bytes; i++) {
        value = (value << BigInt(8)) | BigInt(Math.floor(Math.random() * 256));
    }

    return value;
}

/**
 * Generate realistic-looking values for specific register types
 */
function generateRealisticValue(name: string, size: number): bigint {
    const upperName = name.toUpperCase();

    // Stack pointers typically point to high memory
    if (upperName.includes('SP') || upperName === 'X2' || upperName === 'RSP') {
        return BigInt('0x7FFFFFFFDE80') + BigInt(Math.floor(Math.random() * 0x1000));
    }

    // Base/frame pointers
    if (
        upperName.includes('BP') ||
        upperName.includes('FP') ||
        upperName === 'X29' ||
        upperName === 'X8'
    ) {
        return BigInt('0x7FFFFFFFE000') + BigInt(Math.floor(Math.random() * 0x800));
    }

    // Instruction pointer / PC
    if (upperName === 'RIP' || upperName === 'PC') {
        return BigInt('0x555555555000') + BigInt(Math.floor(Math.random() * 0x10000));
    }

    // Link register / return address
    if (upperName === 'X30' || upperName === 'LR' || upperName === 'X1' || upperName === 'RA') {
        return BigInt('0x555555556000') + BigInt(Math.floor(Math.random() * 0x8000));
    }

    // Zero register (RISC-V x0)
    if (upperName === 'X0' && size === 64) {
        // Could be RISC-V zero or ARM X0
        if (Math.random() > 0.5) {
            return BigInt(0);
        }
    }

    // Flags register - use realistic flag values
    if (upperName.includes('FLAGS') || upperName === 'PSTATE') {
        return BigInt(0x246); // Common flag state
    }

    // SIMD registers - random data
    if (size > 64) {
        return randomValue(size);
    }

    // General registers - mix of small values, addresses, and random
    const rand = Math.random();
    if (rand < 0.2) {
        // Small value
        return BigInt(Math.floor(Math.random() * 1000));
    } else if (rand < 0.4) {
        // Negative-looking value (MSB set)
        return BigInt(
            '0xFFFFFFFFFFFFFF' +
                Math.floor(Math.random() * 256)
                    .toString(16)
                    .padStart(2, '0')
        );
    } else if (rand < 0.6) {
        // Address-like value
        return BigInt('0x555555550000') + BigInt(Math.floor(Math.random() * 0x100000));
    } else {
        // Random
        return randomValue(size);
    }
}

/**
 * Generate mock register state for an architecture
 */
export function generateMockRegisterState(
    arch: Architecture,
    previousState?: RegisterState
): RegisterState {
    const definitions = getArchitectureRegisters(arch);
    const groups = new Map<RegisterGroup, RegisterValue[]>();

    // Group registers
    for (const def of definitions) {
        const group = groups.get(def.group) ?? [];

        // Get previous value if available
        let previousValue: bigint | undefined;
        if (previousState && previousState.architecture === arch) {
            const prevGroup = previousState.groups.get(def.group);
            const prevReg = prevGroup?.find((r) => r.register.name === def.name);
            previousValue = prevReg?.value;
        }

        // Generate new value (with chance of change)
        let value: bigint;
        if (previousValue !== undefined && Math.random() > 0.3) {
            // Keep same value 70% of the time
            value = previousValue;
        } else {
            value = generateRealisticValue(def.name, def.size);
        }

        const changed = previousValue !== undefined && value !== previousValue;

        group.push({
            register: def,
            value,
            previousValue,
            changed,
        });

        groups.set(def.group, group);
    }

    return {
        architecture: arch,
        timestamp: Date.now(),
        groups,
    };
}

/**
 * Simulate register changes (for testing change highlighting)
 */
export function simulateRegisterChange(state: RegisterState): RegisterState {
    const groups = new Map<RegisterGroup, RegisterValue[]>();

    for (const [group, registers] of state.groups) {
        const updated = registers.map((reg) => {
            // 20% chance of change
            if (Math.random() < 0.2) {
                const newValue = generateRealisticValue(reg.register.name, reg.register.size);
                return {
                    ...reg,
                    previousValue: reg.value,
                    value: newValue,
                    changed: true,
                };
            }
            return {
                ...reg,
                changed: false,
            };
        });
        groups.set(group, updated);
    }

    return {
        ...state,
        timestamp: Date.now(),
        groups,
    };
}
