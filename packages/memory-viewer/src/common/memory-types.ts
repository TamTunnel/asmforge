/**
 * Memory Viewer - Type Definitions
 */

/** Memory region classification */
export type MemoryRegion = 'code' | 'data' | 'stack' | 'heap' | 'unknown';

/** Memory access permissions */
export interface MemoryPermissions {
    read: boolean;
    write: boolean;
    execute: boolean;
}

/** Memory region info */
export interface MemoryRegionInfo {
    name: string;
    startAddress: bigint;
    endAddress: bigint;
    region: MemoryRegion;
    permissions: MemoryPermissions;
}

/** Memory byte with metadata */
export interface MemoryByte {
    address: bigint;
    value: number; // 0-255
    region: MemoryRegion;
    isModified: boolean; // Changed since last read
    isBreakpoint: boolean;
}

/** Memory row (16 bytes) for hex display */
export interface MemoryRow {
    address: bigint;
    bytes: MemoryByte[];
}

/** Memory read request */
export interface MemoryReadRequest {
    address: bigint;
    length: number;
}

/** Memory read response */
export interface MemoryReadResponse {
    address: bigint;
    data: Uint8Array;
    error?: string;
}

/** Data type interpretation */
export type DataType =
    | 'int8'
    | 'uint8'
    | 'int16'
    | 'uint16'
    | 'int32'
    | 'uint32'
    | 'int64'
    | 'uint64'
    | 'float32'
    | 'float64'
    | 'pointer'
    | 'string';

/** Data interpretation at an address */
export interface DataInterpretation {
    type: DataType;
    value: string;
    rawBytes: number[];
}

/** Stack frame info for highlighting */
export interface StackFrameInfo {
    framePointer: bigint;
    stackPointer: bigint;
    returnAddress: bigint;
    name?: string;
}

/** Bookmark/annotation */
export interface MemoryAnnotation {
    address: bigint;
    length: number;
    label: string;
    color?: string;
}

/** Memory update event */
export interface MemoryUpdateEvent {
    address: bigint;
    length: number;
    source: 'user' | 'debugger' | 'refresh';
}

/** Virtual scroll state */
export interface VirtualScrollState {
    startAddress: bigint;
    visibleRows: number;
    totalRows: number;
    rowHeight: number;
}

/** Memory viewer configuration */
export interface MemoryViewerConfig {
    bytesPerRow: 16 | 32;
    showAscii: boolean;
    showAnnotations: boolean;
    highlightStackFrame: boolean;
    followPointers: boolean;
    endianness: 'little' | 'big';
}
