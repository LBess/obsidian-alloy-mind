import { Vault } from 'obsidian';

export class VaultFactory {
    static create(vault?: Partial<Vault>): Vault {
        return {
            adapter: vault?.adapter ?? {
                getName: jest.fn(),
                getResourcePath: jest.fn(),
                exists: jest.fn(),
                stat: jest.fn(),
                list: jest.fn(),
                read: jest.fn(),
                readBinary: jest.fn(),
                write: jest.fn(),
                writeBinary: jest.fn(),
                append: jest.fn(),
                process: jest.fn(),
                mkdir: jest.fn(),
                trashSystem: jest.fn(),
                trashLocal: jest.fn(),
                remove: jest.fn(),
                rmdir: jest.fn(),
                rename: jest.fn(),
                copy: jest.fn()
            },
            getName: vault?.getName ?? jest.fn(),
            getFileByPath: vault?.getFileByPath ?? jest.fn(),
            getAbstractFileByPath: vault?.getAbstractFileByPath ?? jest.fn(),
            getFolderByPath: vault?.getFolderByPath ?? jest.fn(),
            getRoot: vault?.getRoot ?? jest.fn(),
            create: vault?.create ?? jest.fn(),
            createBinary: vault?.createBinary ?? jest.fn(),
            createFolder: vault?.createFolder ?? jest.fn(),
            read: vault?.read ?? jest.fn(),
            cachedRead: vault?.cachedRead ?? jest.fn(),
            readBinary: vault?.readBinary ?? jest.fn(),
            getResourcePath: vault?.getResourcePath ?? jest.fn(),
            delete: vault?.delete ?? jest.fn(),
            trash: vault?.trash ?? jest.fn(),
            rename: vault?.rename ?? jest.fn(),
            modify: vault?.modify ?? jest.fn(),
            modifyBinary: vault?.modifyBinary ?? jest.fn(),
            append: vault?.append ?? jest.fn(),
            process: vault?.process ?? jest.fn(),
            copy: vault?.copy ?? jest.fn(),
            getAllLoadedFiles: vault?.getAllLoadedFiles ?? jest.fn(),
            getMarkdownFiles: vault?.getMarkdownFiles ?? jest.fn(),
            getFiles: vault?.getFiles ?? jest.fn(),
            on: vault?.on ?? jest.fn(),
            off: vault?.off ?? jest.fn(),
            offref: vault?.offref ?? jest.fn(),
            trigger: vault?.trigger ?? jest.fn(),
            tryTrigger: vault?.tryTrigger ?? jest.fn(),
            configDir: vault?.configDir ?? '',
            getAllFolders: vault?.getAllFolders ?? jest.fn()
        };
    }
}
