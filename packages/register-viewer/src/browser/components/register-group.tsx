/**
 * Register Viewer - Register Group Component
 */

import * as React from 'react';
import { RegisterValue, RegisterGroup, ValueFormat } from '../../common/register-types';
import { getGroupName } from '../../common/register-data';
import { RegisterRow } from './register-row';

interface RegisterGroupProps {
    group: RegisterGroup;
    registers: RegisterValue[];
    format: ValueFormat;
    defaultCollapsed?: boolean;
}

export const RegisterGroupComponent: React.FC<RegisterGroupProps> = ({
    group,
    registers,
    format,
    defaultCollapsed = false,
}) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

    const toggleCollapse = React.useCallback(() => {
        setCollapsed((prev) => !prev);
    }, []);

    const groupName = getGroupName(group);
    const changedCount = registers.filter((r) => r.changed).length;

    return (
        <div className="register-group">
            <div
                className={`register-group-header ${collapsed ? 'collapsed' : ''}`}
                onClick={toggleCollapse}
            >
                <span className="codicon codicon-chevron-down" />
                <span className="group-name">{groupName}</span>
                <span className="group-count">
                    {changedCount > 0 ? `${changedCount}/` : ''}
                    {registers.length}
                </span>
            </div>
            <div className={`register-group-content ${collapsed ? 'collapsed' : ''}`}>
                {registers.map((reg) => (
                    <RegisterRow key={reg.register.name} register={reg} format={format} />
                ))}
            </div>
        </div>
    );
};
