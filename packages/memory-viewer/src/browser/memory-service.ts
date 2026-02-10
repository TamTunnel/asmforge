/**
 * Memory Viewer - Memory Service
 * Injectable service for managing memory state with virtual scrolling
 */

import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common';
import {
    MemoryRow,
    MemoryUpdateEvent,
    MemoryRegionInfo,
    StackFrameInfo,
    MemoryAnnotation,
    DataType,
    DataInterpretation,
} from '../common/memory-types';
import {
    generateMockMemoryRows,
    simulateMemoryChange,
    DEFAULT_REGIONS,
    MOCK_STACK_FRAME,
} from './memory-mock-data';

export const MemoryService = Symbol('MemoryService');

export interface MemoryService {
    /** Get memory rows for display (with caching) */
    getMemoryRows(startAddress: bigint, rowCount: number): MemoryRow[];

    /** Jump to a specific address */
    jumpToAddress(address: bigint): void;

    /** Current base address */
    readonly currentAddress: bigint;

    /** Get memory regions */
    readonly regions: MemoryRegionInfo[];

    /** Get current stack frame */
    readonly stackFrame: StackFrameInfo | undefined;

    /** Get annotations */
    readonly annotations: MemoryAnnotation[];

    /** Add annotation */
    addAnnotation(annotation: MemoryAnnotation): void;

    /** Remove annotation */
    removeAnnotation(address: bigint): void;

    /** Interpret data at address */
    interpretData(address: bigint, type: DataType): DataInterpretation;

    /** Event when address changes */
    readonly onAddressChange: Event<bigint>;

    /** Event when memory updates */
    readonly onMemoryUpdate: Event<MemoryUpdateEvent>;

    /** Simulate memory change (for testing) */
    simulateChange(): void;

    /** Refresh memory from debugger */
    refresh(): void;
}

@injectable()
export class MemoryServiceImpl implements MemoryService {
    private _currentAddress: bigint = BigInt('0x7FFFFFFFDE00');
    private _cache: Map<string, MemoryRow[]> = new Map();
    private _annotations: MemoryAnnotation[] = [];

    private readonly onAddressChangeEmitter = new Emitter<bigint>();
    readonly onAddressChange = this.onAddressChangeEmitter.event;

    private readonly onMemoryUpdateEmitter = new Emitter<MemoryUpdateEvent>();
    readonly onMemoryUpdate = this.onMemoryUpdateEmitter.event;

    get currentAddress(): bigint {
        return this._currentAddress;
    }

    get regions(): MemoryRegionInfo[] {
        return DEFAULT_REGIONS;
    }

    get stackFrame(): StackFrameInfo | undefined {
        return MOCK_STACK_FRAME;
    }

    get annotations(): MemoryAnnotation[] {
        return this._annotations;
    }

    getMemoryRows(startAddress: bigint, rowCount: number): MemoryRow[] {
        // Align to 16-byte boundary
        const alignedStart = startAddress - (startAddress % BigInt(16));
        const cacheKey = `${alignedStart.toString(16)}_${rowCount}`;

        // Check cache
        let rows = this._cache.get(cacheKey);
        if (!rows) {
            rows = generateMockMemoryRows(alignedStart, rowCount);
            this._cache.set(cacheKey, rows);

            // Limit cache size
            if (this._cache.size > 100) {
                const firstKey = this._cache.keys().next().value;
                if (firstKey) this._cache.delete(firstKey);
            }
        }

        return rows;
    }

    jumpToAddress(address: bigint): void {
        // Align to 16-byte boundary
        const aligned = address - (address % BigInt(16));

        if (aligned !== this._currentAddress) {
            this._currentAddress = aligned;
            this.onAddressChangeEmitter.fire(aligned);
        }
    }

    addAnnotation(annotation: MemoryAnnotation): void {
        // Remove existing at same address
        this._annotations = this._annotations.filter((a) => a.address !== annotation.address);
        this._annotations.push(annotation);
    }

    removeAnnotation(address: bigint): void {
        this._annotations = this._annotations.filter((a) => a.address !== address);
    }

    interpretData(address: bigint, type: DataType): DataInterpretation {
        // Get raw bytes from cache or generate
        const row = this.getMemoryRows(address, 1)[0];
        const offset = Number(address % BigInt(16));

        // Get bytes based on type size
        const sizes: Record<DataType, number> = {
            int8: 1,
            uint8: 1,
            int16: 2,
            uint16: 2,
            int32: 4,
            uint32: 4,
            int64: 8,
            uint64: 8,
            float32: 4,
            float64: 8,
            pointer: 8,
            string: 16,
        };

        const size = sizes[type];
        const rawBytes = row.bytes.slice(offset, offset + size).map((b) => b.value);

        // Interpret value
        let value: string;
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);

        // Write bytes to buffer (little endian)
        rawBytes.forEach((b, i) => {
            if (i < 8) view.setUint8(i, b);
        });

        switch (type) {
            case 'int8':
                value = view.getInt8(0).toString();
                break;
            case 'uint8':
                value = view.getUint8(0).toString();
                break;
            case 'int16':
                value = view.getInt16(0, true).toString();
                break;
            case 'uint16':
                value = view.getUint16(0, true).toString();
                break;
            case 'int32':
                value = view.getInt32(0, true).toString();
                break;
            case 'uint32':
                value = view.getUint32(0, true).toString();
                break;
            case 'int64':
            case 'uint64':
            case 'pointer': {
                // Format as hex address
                const low = view.getUint32(0, true);
                const high = view.getUint32(4, true);
                const bigVal = (BigInt(high) << BigInt(32)) | BigInt(low);
                value =
                    type === 'pointer'
                        ? '0x' + bigVal.toString(16).padStart(16, '0')
                        : bigVal.toString();
                break;
            }
            case 'float32':
                value = view.getFloat32(0, true).toPrecision(6);
                break;
            case 'float64':
                value = view.getFloat64(0, true).toPrecision(10);
                break;
            case 'string':
                value =
                    '"' +
                    rawBytes
                        .filter((b) => b >= 32 && b < 127)
                        .map((b) => String.fromCharCode(b))
                        .join('') +
                    '"';
                break;
            default:
                value = 'N/A';
        }

        return { type, value, rawBytes };
    }

    simulateChange(): void {
        // Update cached rows
        for (const [key, rows] of this._cache.entries()) {
            this._cache.set(key, simulateMemoryChange(rows));
        }

        this.onMemoryUpdateEmitter.fire({
            address: this._currentAddress,
            length: 256,
            source: 'debugger',
        });
    }

    refresh(): void {
        // Clear cache and regenerate
        this._cache.clear();

        this.onMemoryUpdateEmitter.fire({
            address: this._currentAddress,
            length: 256,
            source: 'refresh',
        });
    }
}
