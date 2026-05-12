import { App, Notice, TAbstractFile, TFile, Vault } from "obsidian";
import { getTranslation } from "./i18n/i18n";
import { SettingsManager } from "./settings/settings";
import { StorageMode } from "./models/settings";
import { appendToFile, ensureFileExists, ensureFolderExists, getTaskFilePath } from "./utils/fileUtils";
import { renderTemplate } from "./utils/templateEngine";
import { getCurrentDate } from "./utils/dateUtils";

/**
 * 任务生成器
 * 负责创建任务文件和添加任务内容
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
     * 生成每日任务
     * @param openFile 是否打开文件
     * @param quietMode 静默模式，减少日志输出
     * @returns 成功或失败
     */
    async generateDailyTask(openFile: boolean = true, quietMode: boolean = false): Promise<boolean> {
        try {
            const settings = this.settingsManager.getSettings();
            const storageMode = settings.storageMode;
            const date = getCurrentDate();
            
            // 确定需要处理的路径和模式
            const traditionalRootDir = settings.rootDir.trim() || 'Tasks';
            const traditionalPath = getTaskFilePath(traditionalRootDir);
            const singlePath = settings.singleFilePath.trim() || 'Tasks.md';
            
            const pathsToProcess: { path: string, mode: 'append' | 'overwrite' }[] = [];
            
            if (storageMode === StorageMode.TRADITIONAL || storageMode === StorageMode.BOTH) {
                pathsToProcess.push({ path: traditionalPath, mode: 'append' });
                
                // 确保文件夹存在
                const pathParts = traditionalPath.split('/');
                const year = pathParts.length > 1 ? pathParts[1] : '';
                const yearFolder = `${traditionalRootDir}/${year}`;
                await ensureFolderExists(this.vault, traditionalRootDir);
                await ensureFolderExists(this.vault, yearFolder);
            }
            
            if (storageMode === StorageMode.SINGLE_FILE || storageMode === StorageMode.BOTH) {
                pathsToProcess.push({ path: singlePath, mode: 'overwrite' });
                
                // 确保父目录存在
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
            
            const renderedContent = renderTemplate(template);
            const fullContent = renderedContent;
            
            const dateRegex = new RegExp(`## [^\\n]*${date}[^\\n]*\\n`);
            
            let anyNewTaskCreated = false;
            let fileToOpen: string | null = null;
            let alreadyExistsInAll = true;
            
            for (const item of pathsToProcess) {
                // 确保文件存在
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
                    // 覆盖模式（单文件）
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
            // 显示错误通知
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.showErrorNotice(`${getTranslation('notification.error')} ${errorMsg}`);
            
            return false;
        }
    }
    
    /**
     * 手动添加任务
（从命令面板或图标调用）
     * @returns 成功或失败
     */
    async addTaskManually(): Promise<boolean> {
        try {
            // 调用任务生成逻辑，打开文件
            return await this.generateDailyTask(true);
        } catch (error) {
            // 显示错误通知
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.showErrorNotice(`${getTranslation('notification.error')} ${errorMsg}`);
            
            return false;
        }
    }
    
    /**
     * 显示成功通知
     */
    private showSuccessNotice(message: string): void {
        const notice = new Notice(message, 3500);
        // 使用CSS类而不是内联样式
        notice.noticeEl.classList.add('daily-task-success-notice');
    }
    
    /**
     * 显示警告通知
     */
    private showWarningNotice(message: string): void {
        const notice = new Notice(message, 3500);
        // 使用CSS类而不是内联样式
        notice.noticeEl.classList.add('daily-task-warning-notice');
    }
    
    /**
     * 显示错误通知
     */
    private showErrorNotice(message: string): void {
        const notice = new Notice(message, 3500);
        // 使用CSS类而不是内联样式
        notice.noticeEl.classList.add('daily-task-error-notice');
    }
}