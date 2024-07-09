import { Editor } from 'obsidian';

export class EditorFactory {
    static create(editor?: Partial<Editor>): Editor {
        return {
            getDoc: editor?.getDoc ?? jest.fn(),
            refresh: editor?.refresh ?? jest.fn(),
            getValue: editor?.getValue ?? jest.fn(),
            setValue: editor?.setValue ?? jest.fn(),
            getLine: editor?.getLine ?? jest.fn(),
            setLine: editor?.setLine ?? jest.fn(),
            lineCount: editor?.lineCount ?? jest.fn(),
            lastLine: editor?.lastLine ?? jest.fn(),
            getSelection: editor?.getSelection ?? jest.fn(),
            somethingSelected: editor?.somethingSelected ?? jest.fn(),
            getRange: editor?.getRange ?? jest.fn(),
            replaceSelection: editor?.replaceSelection ?? jest.fn(),
            replaceRange: editor?.replaceRange ?? jest.fn(),
            getCursor: editor?.getCursor ?? jest.fn(),
            listSelections: editor?.listSelections ?? jest.fn(),
            setCursor: editor?.setCursor ?? jest.fn(),
            setSelection: editor?.setSelection ?? jest.fn(),
            setSelections: editor?.setSelections ?? jest.fn(),
            focus: editor?.focus ?? jest.fn(),
            blur: editor?.blur ?? jest.fn(),
            hasFocus: editor?.hasFocus ?? jest.fn(),
            getScrollInfo: editor?.getScrollInfo ?? jest.fn(),
            scrollTo: editor?.scrollTo ?? jest.fn(),
            scrollIntoView: editor?.scrollIntoView ?? jest.fn(),
            undo: editor?.undo ?? jest.fn(),
            redo: editor?.redo ?? jest.fn(),
            exec: editor?.exec ?? jest.fn(),
            transaction: editor?.transaction ?? jest.fn(),
            wordAt: editor?.wordAt ?? jest.fn(),
            posToOffset: editor?.posToOffset ?? jest.fn(),
            offsetToPos: editor?.offsetToPos ?? jest.fn(),
            processLines: editor?.processLines ?? jest.fn()
        };
    }
}
