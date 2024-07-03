import { App } from 'obsidian';
import { WorkspaceFactory } from './WorkspaceFactory';
import { VaultFactory } from './VaultFactory';

export class AppFactory {
    static create(app?: Partial<App>): App {
        return {
            keymap: app?.keymap ?? {
                pushScope: jest.fn(),
                popScope: jest.fn()
            },
            scope: app?.scope ?? {
                register: jest.fn(),
                unregister: jest.fn()
            },
            workspace: app?.workspace ?? WorkspaceFactory.create(),
            vault: app?.vault ?? VaultFactory.create(),
            metadataCache: app?.metadataCache ?? {
                getFirstLinkpathDest: jest.fn(),
                getCache: jest.fn(),
                getFileCache: jest.fn(),
                fileToLinktext: jest.fn(),
                on: jest.fn(),
                off: jest.fn(),
                offref: jest.fn(),
                trigger: jest.fn(),
                tryTrigger: jest.fn(),
                resolvedLinks: {},
                unresolvedLinks: {}
            },
            fileManager: app?.fileManager ?? {
                getNewFileParent: jest.fn(),
                renameFile: jest.fn(),
                generateMarkdownLink: jest.fn(),
                getAvailablePathForAttachment: jest.fn(),
                processFrontMatter: jest.fn()
            },
            lastEvent: app?.lastEvent ?? null
        };
    }
}
