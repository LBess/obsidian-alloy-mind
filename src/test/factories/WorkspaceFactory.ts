import { Workspace, debounce } from 'obsidian';
import { MarkdownFileInfoFactory } from 'test/factories/MarkdownFileInfoFactory';

export class WorkspaceFactory {
    static create(workspace?: Partial<Workspace>): Workspace {
        const htmlElement = document.createElement('div');

        return {
            // @ts-expect-error - Expect undefined parent, b/c we can't bootstrap that object
            leftSplit: workspace?.leftSplit ?? {
                collapsed: false,
                parent: undefined,
                toggle: jest.fn(),
                collapse: jest.fn(),
                expand: jest.fn(),
                getRoot: jest.fn(),
                getContainer: jest.fn(),
                on: jest.fn(),
                off: jest.fn(),
                offref: jest.fn(),
                trigger: jest.fn(),
                tryTrigger: jest.fn()
            },
            // @ts-expect-error - Expect undefined parent, b/c we can't bootstrap that object
            rightSplit: workspace?.rightSplit ?? {
                collapsed: false,
                parent: undefined,
                toggle: jest.fn(),
                collapse: jest.fn(),
                expand: jest.fn(),
                getRoot: jest.fn(),
                getContainer: jest.fn(),
                on: jest.fn(),
                off: jest.fn(),
                offref: jest.fn(),
                trigger: jest.fn(),
                tryTrigger: jest.fn()
            },
            // @ts-expect-error - Expect undefined parent, b/c we can't bootstrap that object
            rootSplit: workspace?.rootSplit ?? {
                win: global.window,
                doc: document,
                parent: undefined,
                getRoot: jest.fn(),
                getContainer: jest.fn(),
                on: jest.fn(),
                off: jest.fn(),
                offref: jest.fn(),
                trigger: jest.fn(),
                tryTrigger: jest.fn()
            },
            leftRibbon: workspace?.leftRibbon ?? {},
            rightRibbon: workspace?.rightRibbon ?? {},
            activeLeaf: workspace?.activeLeaf ?? null,
            containerEl: workspace?.containerEl ?? htmlElement,
            layoutReady: workspace?.layoutReady ?? true,
            requestSaveLayout: workspace?.requestSaveLayout ?? debounce(jest.fn()),
            activeEditor: workspace?.activeEditor ?? MarkdownFileInfoFactory.create(),
            onLayoutReady: workspace?.onLayoutReady ?? jest.fn(),
            changeLayout: workspace?.changeLayout ?? jest.fn(),
            getLayout: workspace?.getLayout ?? jest.fn(),
            createLeafInParent: workspace?.createLeafInParent ?? jest.fn(),
            createLeafBySplit: workspace?.createLeafBySplit ?? jest.fn(),
            splitActiveLeaf: workspace?.splitActiveLeaf ?? jest.fn(),
            duplicateLeaf: workspace?.duplicateLeaf ?? jest.fn(),
            getUnpinnedLeaf: workspace?.getUnpinnedLeaf ?? jest.fn(),
            getLeaf: workspace?.getLeaf ?? jest.fn(),
            moveLeafToPopout: workspace?.moveLeafToPopout ?? jest.fn(),
            openPopoutLeaf: workspace?.openPopoutLeaf ?? jest.fn(),
            openLinkText: workspace?.openLinkText ?? jest.fn(),
            setActiveLeaf: workspace?.setActiveLeaf ?? jest.fn(),
            getLeafById: workspace?.getLeafById ?? jest.fn(),
            getGroupLeaves: workspace?.getGroupLeaves ?? jest.fn(),
            getMostRecentLeaf: workspace?.getMostRecentLeaf ?? jest.fn(),
            getLeftLeaf: workspace?.getLeftLeaf ?? jest.fn(),
            getRightLeaf: workspace?.getRightLeaf ?? jest.fn(),
            getActiveViewOfType: workspace?.getActiveViewOfType ?? jest.fn(),
            getActiveFile: workspace?.getActiveFile ?? jest.fn(),
            iterateRootLeaves: workspace?.iterateRootLeaves ?? jest.fn(),
            iterateAllLeaves: workspace?.iterateAllLeaves ?? jest.fn(),
            getLeavesOfType: workspace?.getLeavesOfType ?? jest.fn(),
            detachLeavesOfType: workspace?.detachLeavesOfType ?? jest.fn(),
            revealLeaf: workspace?.revealLeaf ?? jest.fn(),
            getLastOpenFiles: workspace?.getLastOpenFiles ?? jest.fn(),
            updateOptions: workspace?.updateOptions ?? jest.fn(),
            on: workspace?.on ?? jest.fn(),
            off: workspace?.off ?? jest.fn(),
            offref: workspace?.offref ?? jest.fn(),
            trigger: workspace?.trigger ?? jest.fn(),
            tryTrigger: workspace?.tryTrigger ?? jest.fn()
        };
    }
}
