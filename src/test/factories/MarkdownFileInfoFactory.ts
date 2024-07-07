import { MarkdownFileInfo } from 'obsidian';
import { EditorFactory } from './EditorFactory';
import { AppFactory } from './AppFactory';

export class MarkdownFileInfoFactory {
    static create(markdownFileInfo?: Partial<MarkdownFileInfo>): MarkdownFileInfo {
        return {
            app: markdownFileInfo?.app ?? AppFactory.create(),
            file: markdownFileInfo?.file ?? null,
            hoverPopover: markdownFileInfo?.hoverPopover ?? null,
            editor: markdownFileInfo?.editor ?? EditorFactory.create()
        };
    }
}
