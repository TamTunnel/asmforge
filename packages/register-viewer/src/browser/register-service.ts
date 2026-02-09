/**
 * Register Viewer - Register Service
 * Injectable service for managing register state
 */

import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common';
import { Architecture, RegisterState, RegisterUpdateEvent } from '../common/register-types';
import { generateMockRegisterState, simulateRegisterChange } from './register-mock-data';

export const RegisterService = Symbol('RegisterService');

export interface RegisterService {
    /** Current architecture */
    readonly currentArchitecture: Architecture;

    /** Get current register state */
    getRegisterState(): RegisterState | undefined;

    /** Set architecture (switches register set) */
    setArchitecture(arch: Architecture): void;

    /** Event fired when registers update */
    readonly onRegisterUpdate: Event<RegisterUpdateEvent>;

    /** Simulate a register change (for testing) */
    simulateChange(): void;

    /** Connect to real debugger (future) */
    // connectDebugger(session: DebugSession): void;
}

@injectable()
export class RegisterServiceImpl implements RegisterService {
    private _currentArchitecture: Architecture = 'x86-64';
    private _registerState: RegisterState | undefined;

    private readonly onRegisterUpdateEmitter = new Emitter<RegisterUpdateEvent>();
    readonly onRegisterUpdate = this.onRegisterUpdateEmitter.event;

    get currentArchitecture(): Architecture {
        return this._currentArchitecture;
    }

    getRegisterState(): RegisterState | undefined {
        // Initialize with mock data if not set
        if (!this._registerState) {
            this._registerState = generateMockRegisterState(this._currentArchitecture);
        }
        return this._registerState;
    }

    setArchitecture(arch: Architecture): void {
        if (arch !== this._currentArchitecture) {
            this._currentArchitecture = arch;
            this._registerState = generateMockRegisterState(arch);

            this.onRegisterUpdateEmitter.fire({
                architecture: arch,
                changedRegisters: [],
                state: this._registerState,
            });
        }
    }

    simulateChange(): void {
        if (!this._registerState) {
            this._registerState = generateMockRegisterState(this._currentArchitecture);
        }

        const newState = simulateRegisterChange(this._registerState);
        const changedRegisters: string[] = [];

        for (const [, registers] of newState.groups) {
            for (const reg of registers) {
                if (reg.changed) {
                    changedRegisters.push(reg.register.name);
                }
            }
        }

        this._registerState = newState;

        if (changedRegisters.length > 0) {
            this.onRegisterUpdateEmitter.fire({
                architecture: this._currentArchitecture,
                changedRegisters,
                state: newState,
            });
        }
    }
}
