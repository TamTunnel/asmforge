/**
 * Register Viewer - Type Definitions
 */

/** Supported CPU architectures */
export type Architecture = 'x86-64' | 'arm64' | 'riscv64';

/** Register group categories */
export type RegisterGroup = 'general' | 'special' | 'simd' | 'flags' | 'float';

/** Value display format */
export type ValueFormat = 'hex' | 'dec' | 'bin';

/** Single register definition */
export interface RegisterDefinition {
    /** Register name (e.g., RAX, X0, x1) */
    name: string;
    /** Size in bits (8, 16, 32, 64, 128, 256, 512) */
    size: number;
    /** Group this register belongs to */
    group: RegisterGroup;
    /** Human-readable description */
    description: string;
    /** Alternative names (e.g., EAX for lower 32 bits of RAX) */
    aliases?: string[];
}

/** Register with current value */
export interface RegisterValue {
    /** Register definition */
    register: RegisterDefinition;
    /** Current value as BigInt (supports 512-bit) */
    value: bigint;
    /** Previous value (for change detection) */
    previousValue?: bigint;
    /** Whether this register changed since last update */
    changed: boolean;
}

/** Complete register state for an architecture */
export interface RegisterState {
    /** Current architecture */
    architecture: Architecture;
    /** Timestamp of last update */
    timestamp: number;
    /** All register values grouped */
    groups: Map<RegisterGroup, RegisterValue[]>;
}

/** Register update event */
export interface RegisterUpdateEvent {
    /** Architecture that was updated */
    architecture: Architecture;
    /** List of register names that changed */
    changedRegisters: string[];
    /** New register state */
    state: RegisterState;
}

/** Value classification for color coding */
export type ValueClassification =
    | 'neutral' // Default display
    | 'negative' // MSB set (signed negative)
    | 'address' // Looks like memory address
    | 'zero' // All zeros
    | 'changed' // Recently changed
    | 'pointer'; // Stack/base pointer
