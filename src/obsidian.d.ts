
declare module "obsidian" {
    export class Plugin {
        app: App;
        manifest: PluginManifest;
        loadData(): Promise<unknown>;
        saveData(data: unknown): Promise<void>;
        addSettingTab(settingTab: PluginSettingTab): void;
        addCommand(command: Command): void;
    }

    export interface App {
        workspace: Workspace;
        vault: Vault;
    }

    export interface Workspace {
        getLeaf(): WorkspaceLeaf;
    }

    export interface WorkspaceLeaf {
        openFile(file: TFile): Promise<void>;
    }

    export interface Vault {
        getAbstractFileByPath(path: string): TAbstractFile | null;
        createFolder(path: string): Promise<void>;
        create(path: string, data: string): Promise<TFile>;
        read(file: TFile): Promise<string>;
        modify(file: TFile, data: string): Promise<void>;
    }

    export class TAbstractFile {
        path: string;
        name: string;
        vault: Vault;
    }

    export class TFile extends TAbstractFile {
        extension: string;
    }

    export class TFolder extends TAbstractFile {
        children: TAbstractFile[];
    }

    export interface PluginManifest {
        id: string;
        name: string;
        version: string;
        description: string;
    }

    export interface Command {
        id: string;
        name: string;
        callback: () => void;
        checkCallback?: (checking: boolean) => boolean | void;
        hotkeys?: Hotkey[];
    }

    export interface Hotkey {
        modifiers: string[];
        key: string;
    }

    export abstract class PluginSettingTab {
        constructor(app: App, plugin: Plugin);
        containerEl: HTMLElement;
        abstract display(): void;
    }

    export class Setting {
        constructor(containerEl: HTMLElement);
        setName(name: string): this;
        setDesc(desc: string): this;
        setClass(cls: string): this;
        setHeading(): this;
        addText(cb: (text: TextComponent) => void): this;
        addButton(cb: (button: ButtonComponent) => void): this;
        addTextArea(cb: (text: TextAreaComponent) => void): this;
        addToggle(cb: (toggle: ToggleComponent) => void): this;
        addDropdown(cb: (dropdown: DropdownComponent) => void): this;
        controlEl: HTMLElement;
        nameEl: HTMLElement;
        descEl: HTMLElement;
        infoEl: HTMLElement;
        settingEl: HTMLElement;
    }

    export class Component {}

    export class MarkdownRenderer {
        static renderMarkdown(
            markdown: string,
            el: HTMLElement,
            sourcePath: string,
            component: Component
        ): Promise<void>;
    }

    export class ButtonComponent {
        constructor(containerEl: HTMLElement);
        buttonEl: HTMLButtonElement;
        setButtonText(name: string): this;
        setDisabled(disabled: boolean): this;
        setCta(): this;
        onClick(callback: () => void): this;
    }

    export class TextComponent {
        constructor(containerEl: HTMLElement);
        inputEl: HTMLInputElement;
        setValue(value: string): this;
        getValue(): string;
        onChange(callback: (value: string) => void): this;
    }

    export class TextAreaComponent {
        constructor(containerEl: HTMLElement);
        inputEl: HTMLTextAreaElement;
        setValue(value: string): this;
        getValue(): string;
        setPlaceholder(placeholder: string): this;
        onChange(callback: (value: string) => void): this;
    }

    export class ToggleComponent {
        constructor(containerEl: HTMLElement);
        setValue(value: boolean): this;
        onChange(callback: (value: boolean) => void): this;
    }

    export class DropdownComponent {
        constructor(containerEl: HTMLElement);
        addOption(value: string, display: string): this;
        setValue(value: string): this;
        onChange(callback: (value: string) => void): this;
    }

    export function addIcon(iconId: string, svgContent: string): void;
    export function setIcon(el: HTMLElement, iconId: string): void;
    
    export class Notice {
        constructor(message: string, timeout?: number);
        noticeEl: HTMLElement;
    }

    export function normalizePath(path: string): string;
} 