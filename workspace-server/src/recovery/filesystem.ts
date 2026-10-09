import { createHash } from 'node:crypto';
import { constants, createReadStream, lstatSync, openSync, mkdirSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { WorkspaceRecoveryError } from './errors';

export const safeRelative = (value: string): string => {
    const normalized = value.replace(/\\/g, '/');
    const parts = normalized.split('/');
    if (!value || parts.some(part => !part || part === '.' || part === '..'
        || /[\x00-\x1f<>:"|?*]/.test(part) || /[. ]$/.test(part)
        || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) {
        throw new WorkspaceRecoveryError('BACKUP_SOURCE_UNSAFE', 'Unsafe Workspace-relative recovery path.');
    }
    return normalized;
};

export const noLinks = (absolute: string, allowMissing = false): void => {
    const resolved = path.resolve(absolute);
    const { root } = path.parse(resolved);
    let current = root;
    for (const segment of resolved.slice(root.length).split(path.sep).filter(Boolean)) {
        current = path.join(current, segment);
        try {
            const info = lstatSync(current);
            if (info.isSymbolicLink() || (!info.isDirectory() && current !== resolved)) {
                throw new WorkspaceRecoveryError('BACKUP_SOURCE_UNSAFE', 'Recovery path traverses a link or non-directory.');
            }
        } catch (error) {
            if (allowMissing && (error as NodeJS.ErrnoException).code === 'ENOENT') return;
            throw error;
        }
    }
};

export const under = (root: string, relative: string): string => {
    const target = path.join(root, ...safeRelative(relative).split('/'));
    noLinks(target, true);
    return target;
};

export const directory = (root: string, relative: string): string => {
    const target = under(root, relative);
    mkdirSync(target, { recursive: true });
    noLinks(target);
    if (!lstatSync(target).isDirectory()) throw new WorkspaceRecoveryError('BACKUP_SOURCE_UNSAFE', 'Expected directory.');
    return target;
};

export type Tree = { files: string[]; directories: string[] };
export const walk = (root: string, relative = '', exclude = new Set<string>()): Tree => {
    noLinks(root);
    const files: string[] = [];
    const directories: string[] = [];
    const visit = (rel: string) => {
        if (exclude.has(rel)) return;
        const target = rel ? under(root, rel) : root;
        const info = lstatSync(target);
        if (info.isSymbolicLink()) throw new WorkspaceRecoveryError('BACKUP_SOURCE_UNSAFE', 'Recovery subtree contains a link.');
        if (info.isDirectory()) {
            if (rel) directories.push(rel);
            for (const name of readdirSync(target).sort()) visit(rel ? `${rel}/${name}` : name);
        } else if (info.isFile()) files.push(rel);
        else throw new WorkspaceRecoveryError('BACKUP_SOURCE_UNSAFE', 'Recovery subtree contains a non-regular file.');
    };
    visit(relative);
    return { files, directories };
};

export const copyTree = async (source: string, destination: string, tree: Tree) => {
    for (const rel of tree.directories) directory(destination, rel);
    for (const rel of tree.files) {
        const from = under(source, rel);
        const to = under(destination, rel);
        if (path.posix.dirname(rel) !== '.') directory(destination, path.posix.dirname(rel));
        await copyFile(from, to, constants.COPYFILE_EXCL);
        noLinks(from);
        noLinks(to);
    }
};

export const fileIntegrity = async (file: string) => {
    noLinks(file);
    const before = lstatSync(file);
    if (!before.isFile()) throw new WorkspaceRecoveryError('BACKUP_INVALID', 'Payload entry is not a regular file.');
    const hash = createHash('sha256');
    let size = 0;
    for await (const chunk of createReadStream(file, { fd: openSync(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0)), autoClose: true })) {
        const bytes = chunk as Buffer;
        hash.update(bytes); size += bytes.length;
    }
    const after = lstatSync(file);
    if (before.size !== size || after.size !== size || before.mtimeMs !== after.mtimeMs) {
        throw new WorkspaceRecoveryError('BACKUP_INVALID', 'Payload file changed during integrity validation.');
    }
    return { size_bytes: size, sha256: hash.digest('hex') };
};

export const atomicJson = (file: string, value: unknown) => {
    noLinks(file, true);
    const temporary = `${file}.pending`;
    noLinks(temporary, true);
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
    renameSync(temporary, file);
};
