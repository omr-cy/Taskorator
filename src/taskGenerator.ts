import { App, Notice, TAbstractFile, TFile, Vault } from "obsidian";
import { getTranslation } from "./i18n/i18n";
import { SettingsManager } from "./settings/settings";
import { StorageMode } from "./models/settings";
import { appendToFile, ensureFileExists, ensureFolderExists, getTaskFilePath } from "./utils/fileUtils";
import { renderTemplate } from "./utils/templateEngine";
import { getCurrentDate } from "./utils/dateUtils";

/**
 * Task Generator
 * Responsible for creating task files and adding task content
 */
export class TaskGenerator {
    private app: App;
    private vault: Vault;
    private settingsManager: SettingsManager;

    constructor(app: App, settingsManager: SettingsManager) {
        this.app = app;
        this.vault = app.vault;
        this.settingsManager = settingsManager;
    }

    /**
     * Generate daily task
     * @param openFile Whether to open the file
     * @param quietMode Quiet mode, reduce log output
     * @returns boolean indicating success
     */
    async generateDailyTask(openFile: boolean = true, quietMode: boolean = false): Promise<boolean> {
        try {
            const settings = this.settingsManager.getSettings();
            const storageMode = settings.storageMode;
            const date = getCurrentDate();
            
            // Determine paths and modes to process
            const traditionalRootDir = settings.rootDir.trim() || 'Tasks';
            const traditionalPath = getTaskFilePath(traditionalRootDir);
            const singlePath = settings.singleFilePath.trim() || 'Tasks.md';
            
            const pathsToProcess: { path: string, mode: 'append' | 'overwrite' }[] = [];
            
            if (storageMode === StorageMode.TRADITIONAL || storageMode === StorageMode.BOTH) {
                pathsToProcess.push({ path: traditionalPath, mode: 'append' });
                
                // Ensure folders exist
                const pathParts = traditionalPath.split('/');
                const year = pathParts.length > 1 ? pathParts[1] : '';
                const yearFolder = `${traditionalRootDir}/${year}`;
                await ensureFolderExists(this.vault, traditionalRootDir);
                await ensureFolderExists(this.vault, yearFolder);
            }
            
            if (storageMode === StorageMode.SINGLE_FILE || storageMode === StorageMode.BOTH) {
                pathsToProcess.push({ path: singlePath, mode: 'overwrite' });
                
                // Ensure parent directory exists
                const parts = singlePath.split('/');
                if (parts.length > 1) {
                    const dirPath = parts.slice(0, parts.length - 1).join('/');
                    await ensureFolderExists(this.vault, dirPath);
                }
            }
            
            if (pathsToProcess.length === 0) return false;
            
            let template = '';
            if (this.settingsManager.hasCustomTemplate()) {
                template = this.settingsManager.getSettings().customTemplate;
            } else {
                template = this.settingsManager.getTemplateByLanguage();
            }
            
            const renderedContent = renderTemplate(template, this.settingsManager.getCurrentOutputLanguage());
            const fullContent = renderedContent;
            
            const dateRegex = new RegExp(`## [^\\n]*${date}[^\\n]*\\n`);
            
            let anyNewTaskCreated = false;
            let fileToOpen: string | null = null;
            let alreadyExistsInAll = true;
            
            for (const item of pathsToProcess) {
                // Ensure file exists
                await ensureFileExists(this.vault, item.path);
                
                const abstractFile = this.vault.getAbstractFileByPath(item.path);
                if (!abstractFile || !(abstractFile instanceof TFile)) continue;
                
                if (item.mode === 'append') {
                    const fileContent = await this.vault.read(abstractFile);
                    if (dateRegex.test(fileContent)) {
                        if (!fileToOpen) fileToOpen = item.path;
                        continue;
                    }
                    
                    const success = await appendToFile(this.vault, item.path, fullContent);
                    if (success) {
                        anyNewTaskCreated = true;
                        alreadyExistsInAll = false;
                        if (!fileToOpen) fileToOpen = item.path;
                    }
                } else {
                    // Overwrite mode (single file)
                    await this.vault.modify(abstractFile, fullContent);
                    anyNewTaskCreated = true;
                    alreadyExistsInAll = false;
                    if (!fileToOpen) fileToOpen = item.path;
                }
            }
            
            if (anyNewTaskCreated) {
                if (openFile && fileToOpen) {
                    const file = this.vault.getAbstractFileByPath(fileToOpen);
                    if (file instanceof TFile) {
                        const leaf = this.app.workspace.getLeaf();
                        await leaf.openFile(file);
                        
                        setTimeout(() => {
                            this.showSuccessNotice(`${getTranslation('notification.taskAdded')}`);
                        }, 300);
                    }
                }
                return true;
            }
            
            if (alreadyExistsInAll && openFile && fileToOpen) {
                this.showWarningNotice(`${getTranslation('notification.taskExists')}`);
                const file = this.vault.getAbstractFileByPath(fileToOpen);
                if (file && file instanceof TFile) {
                    const leaf = this.app.workspace.getLeaf();
                    await leaf.openFile(file);
                }
                return true;
            }
            
            return false;
        } catch (error) {
            // Show error notice
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.showErrorNotice(`${getTranslation('notification.error')} ${errorMsg}`);
            
            return false;
        }
    }
    
    /**
     * Manually add task
     * (Called from command palette or icon)
     * @returns boolean indicating success
     */
    async addTaskManually(): Promise<boolean> {
        try {
            // Call task generation logic and open the file
            return await this.generateDailyTask(true);
        } catch (error) {
            // Show error notice
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.showErrorNotice(`${getTranslation('notification.error')} ${errorMsg}`);
            
            return false;
        }
    }
    
    /**
     * Show success notice
     */
    private showSuccessNotice(message: string): void {
        const notice = new Notice(message, 3500);
        // Use CSS class instead of inline style
        notice.noticeEl.classList.add('daily-task-success-notice');
    }
    
    /**
     * Show warning notice
     */
    private showWarningNotice(message: string): void {
        const notice = new Notice(message, 3500);
        // Use CSS class instead of inline style
        notice.noticeEl.classList.add('daily-task-warning-notice');
    }
    
    /**
     * Show error notice
     */
    private showErrorNotice(message: string): void {
        const notice = new Notice(message, 3500);
        // Use CSS class instead of inline style
        notice.noticeEl.classList.add('daily-task-error-notice');
    }
}