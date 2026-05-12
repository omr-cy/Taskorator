
interface HTMLElement {
    addClass(cls: string): void;
    removeClass(cls: string): void;
    toggleClass(cls: string): void;
    empty(): void;
    createEl<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: object): HTMLElementTagNameMap[K];
} 