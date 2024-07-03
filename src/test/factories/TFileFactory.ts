import { TFile } from 'obsidian';
import { VaultFactory } from './VaultFactory';

export class TFileFactory {
    static create(file?: Partial<TFile>): TFile {
        return {
            stat: file?.stat ?? {
                ctime: 0,
                mtime: 0,
                size: 0,
            },
            basename: file?.basename ?? '',
            extension: file?.extension ?? 'md',
            path: file?.path ?? '',
            name: file?.name ?? '',
            parent: file?.parent ?? null,
            vault: file?.vault ?? VaultFactory.create(),
        }
    }
}
