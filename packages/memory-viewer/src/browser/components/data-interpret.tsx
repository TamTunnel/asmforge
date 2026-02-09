/**
 * Memory Viewer - Data Interpretation Panel
 * Shows data type interpretations at selected address
 */

import * as React from 'react';
import { DataType, DataInterpretation } from '../../common/memory-types';
import { MemoryService } from '../memory-service';

interface DataInterpretPanelProps {
    memoryService: MemoryService;
    address: bigint;
}

const DATA_TYPES: DataType[] = [
    'uint8',
    'int8',
    'uint16',
    'int16',
    'uint32',
    'int32',
    'uint64',
    'pointer',
    'float32',
    'float64',
    'string',
];

export const DataInterpretPanel: React.FC<DataInterpretPanelProps> = ({
    memoryService,
    address,
}) => {
    const interpretations = React.useMemo(() => {
        const results: DataInterpretation[] = [];
        for (const type of DATA_TYPES) {
            try {
                results.push(memoryService.interpretData(address, type));
            } catch {
                results.push({ type, value: 'N/A', rawBytes: [] });
            }
        }
        return results;
    }, [memoryService, address]);

    return (
        <div className="memory-interpret-panel">
            {interpretations.map((interp) => (
                <div key={interp.type} className="interpret-item">
                    <label>{interp.type}</label>
                    <span
                        className={`value ${interp.type === 'pointer' ? 'pointer' : ''} ${interp.type === 'string' ? 'string' : ''}`}
                    >
                        {interp.value}
                    </span>
                </div>
            ))}
        </div>
    );
};
