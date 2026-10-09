import { WorkspaceRecoveryError } from '../recovery/errors';

export type MaintenanceMode = 'NORMAL' | 'BACKUP' | 'MIGRATION' | 'RESTORE';

/** One coordinator per Workspace runtime owner. Leases cover entire async operations. */
export class WorkspaceMaintenanceCoordinator {
    private currentMode: MaintenanceMode = 'NORMAL';
    private mutations = 0;
    private reads = 0;

    get mode() { return this.currentMode; }

    private conflict(): never {
        throw new WorkspaceRecoveryError('WORKSPACE_MAINTENANCE_ACTIVE',
            `Workspace maintenance (${this.currentMode}) or an in-flight operation prevents this operation.`);
    }

    assertReadable() {
        if (this.currentMode === 'RESTORE' || this.currentMode === 'MIGRATION') this.conflict();
    }

    assertMutable() {
        if (this.currentMode !== 'NORMAL') this.conflict();
    }

    acquireRead() {
        this.assertReadable();
        this.reads++;
        let released = false;
        return () => { if (!released) { released = true; this.reads--; } };
    }

    private run<T>(operation: () => T, release: () => void): T {
        try {
            const result = operation();
            if (result instanceof Promise) return result.finally(release) as T;
            release();
            return result;
        } catch (error) { release(); throw error; }
    }

    read<T>(operation: () => T): T {
        return this.run(operation, this.acquireRead());
    }

    mutate<T>(operation: () => T): T {
        this.assertMutable();
        this.mutations++;
        return this.run(operation, () => { this.mutations--; });
    }

    acquireMaintenance(mode: Exclude<MaintenanceMode, 'NORMAL'>) {
        if (this.currentMode !== 'NORMAL' || this.mutations > 0
            || (mode !== 'BACKUP' && this.reads > 0)) this.conflict();
        this.currentMode = mode;
        let released = false;
        return () => { if (!released) { released = true; this.currentMode = 'NORMAL'; } };
    }

    async maintain<T>(mode: Exclude<MaintenanceMode, 'NORMAL'>, operation: () => Promise<T>): Promise<T> {
        const release = this.acquireMaintenance(mode);
        try { return await operation(); }
        finally { release(); }
    }

    /** Guard the service boundary, including in-process callers and nested async mutations. */
    guard<T extends object>(service: T, mutationMethods: readonly string[]): T {
        return new Proxy(service, {
            get: (target, property) => {
                const value: unknown = Reflect.get(target, property, target);
                if (typeof value !== 'function') return value;
                return (...args: unknown[]) => {
                    const call = () => Reflect.apply(value, target, args) as unknown;
                    return mutationMethods.includes(String(property)) ? this.mutate(call) : this.read(call);
                };
            },
        });
    }
}
