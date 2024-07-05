import { TFolder } from 'obsidian';
import { VaultFactory } from 'test/factories/VaultFactory';

export class TFolderFactory {
    static create(folder?: Partial<TFolder>): TFolder {
        return {
            children: folder?.children ?? [],
            isRoot: folder?.isRoot ?? jest.fn().mockReturnValue(false),
            path: folder?.path ?? '',
            name: folder?.name ?? '',
            parent: folder?.parent ?? null,
            vault: folder?.vault ?? VaultFactory.create(),
        }
    }
}
