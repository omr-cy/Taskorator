import { Plugin, addIcon } from 'obsidian';
import { AutoGenerateMode } from './models/settings';
import { TaskoratorSettingTab, SettingsManager } from './settings/settings';
import { getTranslation, setCurrentLanguage } from './i18n/i18n';
import { isWorkday } from './utils/dateUtils';
import { TaskGenerator } from './taskGenerator';
import { DAILY_TASK_ICON } from './ui/icons';

/**
 * Taskorator plugin main class
 */
export default class TaskoratorPlugin extends Plugin {
    // Settings manager
    settingsManager: SettingsManager;
    
    // Task generator
    taskGenerator: TaskGenerator;

    /**
     * Called when the plugin is loaded
     */
    async onload() {
        // Add plugin icon
        addIcon('daily-task', DAILY_TASK_ICON);
        
        // Initialize settings manager
        this.settingsManager = new SettingsManager(this);
        await this.settingsManager.loadSettings();
        
        // Initialize task generator
        this.taskGenerator = new TaskGenerator(this.app, this.settingsManager);
        
        // Set language
        setCurrentLanguage(this.settingsManager.getCurrentLanguage());
        
        // Add settings tab
        this.addSettingTab(new TaskoratorSettingTab(this.app, this));
        
        // Add manual task generation command
        this.addCommand({
            id: 'add-daily-task',
            name: getTranslation('commands.addDailyTask'),
            callback: () => {
                void this.taskGenerator.addTaskManually();
            }
        });
        
        // Check if auto-generation is needed after 10 seconds
        // This ensures Obsidian is fully loaded to avoid conflicts during startup
        setTimeout(() => {
            void this.checkAutoGenerate();
        }, 10000);
    }
    
    /**
     * Called when the plugin is unloaded
     */
    onunload() {
        // Plugin unload cleanup
    }
    
    /**
     * Check if auto-generation is needed
     */
    private async checkAutoGenerate() {
        const settings = this.settingsManager.getSettings();
        
        switch (settings.autoGenerateMode) {
            case AutoGenerateMode.DAILY:
                // Auto-generate daily (silent mode, does not open file)
                await this.taskGenerator.generateDailyTask(false, true);
                break;
                
            case AutoGenerateMode.WORKDAY:
                // Auto-generate on workdays (silent mode, does not open file)
                if (isWorkday()) {
                    await this.taskGenerator.generateDailyTask(false, true);
                }
                break;
                
            case AutoGenerateMode.NONE:
            default:
                // No auto-generation
                break;
        }
    }
}
 