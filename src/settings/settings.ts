// @ts-ignore
import { App, ButtonComponent, DropdownComponent, Notice, Plugin, PluginSettingTab, Setting, TextAreaComponent, TextComponent, ToggleComponent, MarkdownRenderer, Component } from 'obsidian';
import { AutoGenerateMode, DEFAULT_SETTINGS, DEFAULT_TEMPLATE_EN, DEFAULT_TEMPLATE_ZH, DEFAULT_TEMPLATE_AR, TaskoratorSettings, Language, StorageMode } from '../models/settings';
import { getTranslation, setCurrentLanguage } from '../i18n/i18n';
import { renderTemplate } from '../utils/templateEngine';
import { TaskGenerator } from '../taskGenerator';
import { setTextContentByLines, createIconButton, createTextElement } from '../utils/domUtils';
// Import main plugin type definition
import TaskoratorPlugin from '../main';

// CSS related constants (class names)
const SettingsSectionCSS = "daily-task-settings-section";
const ButtonCSS = "daily-task-button";
const PreviewButtonCSS = "daily-task-preview-button";
const ResetButtonCSS = "daily-task-reset-button";
const EditorCSS = "daily-task-editor";
const VerticalStackCSS = "daily-task-vertical-stack";
const TextRightCSS = "daily-task-text-right";
const TextCenterCSS = "daily-task-text-center";
const ScrollbarSlimCSS = "daily-task-slim-scrollbar";
const SaveIndicatorCSS = "daily-task-save-indicator";
const SuccessIconCSS = "daily-task-success-icon";
const SettingTopSpaceCSS = "daily-task-setting-top-space";
const InputContainerCSS = "daily-task-input-container";
const InputCSS = "daily-task-input";

/**
 * Add custom plugin styles
 * Note: Styling content has now been moved to an external CSS file
 */
function addCustomStyles() {
    // Styles moved to src/styles.css, no need to add inline styles here
    // Styles.css will be loaded automatically when the plugin loads
}

/**
 * Plugin settings tab
 */
export class TaskoratorSettingTab extends PluginSettingTab {
    plugin: Plugin;
    settingsManager: SettingsManager;
    taskGenerator: TaskGenerator;
    previewEl: HTMLElement | null = null;
    addTaskButton: ButtonComponent | null = null;
    
    // Directory input box
    rootDirInput: TextComponent | null = null;
    
    // Flag for whether settings have been modified but not saved
    dirtySettings: boolean = false;
    
    // Method to auto-save directory
    autoSaveRootDir: (value: string) => Promise<void>;

    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
        
        // Get settings manager reference from parent plugin - cast to TaskoratorPlugin instead of any
        this.settingsManager = (plugin as TaskoratorPlugin).settingsManager;
        
        // Create task generator
        this.taskGenerator = new TaskGenerator(app, this.settingsManager);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.classList.add('daily-task-setting-tab');
        
        const settings = this.settingsManager.getSettings();
        
        // 设置RTL支持
        if (this.settingsManager.getCurrentLanguage() === 'ar') {
            containerEl.classList.add('daily-task-rtl');
        } else {
            containerEl.classList.remove('daily-task-rtl');
        }

        // Setting sections titles
        containerEl.createEl('h2', { text: getTranslation('settings.basicSettings') });
        
        // Output mode settings
        let singleFilePathSetting: Setting | null = null;
        let rootDirSetting: Setting | null = null;
        
        const storageModeSetting = new Setting(containerEl)
            .setName(getTranslation('settings.outputMode'))
            .setDesc(getTranslation('settings.outputMode.desc'))
            .addDropdown(dropdown => {
                dropdown
                    .addOption(StorageMode.TRADITIONAL, getTranslation('settings.outputMode.traditional'))
                    .addOption(StorageMode.SINGLE_FILE, getTranslation('settings.outputMode.singleFile'))
                    .addOption(StorageMode.BOTH, getTranslation('settings.outputMode.both'))
                    .setValue(settings.storageMode)
                    .onChange(async (value) => {
                        if (singleFilePathSetting && rootDirSetting) {
                            if (value === StorageMode.SINGLE_FILE) {
                                (singleFilePathSetting as any).settingEl.style.display = 'flex';
                                (rootDirSetting as any).settingEl.style.display = 'none';
                            } else if (value === StorageMode.BOTH) {
                                (singleFilePathSetting as any).settingEl.style.display = 'flex';
                                (rootDirSetting as any).settingEl.style.display = 'flex';
                            } else {
                                (singleFilePathSetting as any).settingEl.style.display = 'none';
                                (rootDirSetting as any).settingEl.style.display = 'flex';
                            }
                        }
                        await this.settingsManager.updateSettings({ storageMode: value as StorageMode });
                    });
            });

        // Root directory settings
        rootDirSetting = new Setting(containerEl)
            .setName(getTranslation('settings.rootDir'))
            .setDesc(getTranslation('settings.rootDir.desc'));
            
        // Create input container to allow extra elements
        const inputContainer = document.createElement('div');
        inputContainer.classList.add(InputContainerCSS);
        rootDirSetting.controlEl.appendChild(inputContainer);
        
        this.rootDirInput = new TextComponent(inputContainer)
            .setValue(settings.rootDir)
            .onChange(async (value) => {
                if (value.trim() !== '') {
                    // Settings changed, prepare for auto-save
                    this.dirtySettings = true;
                    
                    // Start auto-save timer
                    this.autoSaveRootDir(value);
                }
            });
        
        // Set class and placeholder attributes for input element
        if (this.rootDirInput && this.rootDirInput.inputEl) {
            this.rootDirInput.inputEl.classList.add(InputCSS);
            this.rootDirInput.inputEl.placeholder = 'DailyTasks';
        }
        
        // Add auto-save indicator
        const saveIndicator = document.createElement('div');
        saveIndicator.classList.add(SaveIndicatorCSS);
        inputContainer.appendChild(saveIndicator);
        
        // Create save success icon
        const saveSuccessIcon = document.createElement('span');
        saveSuccessIcon.classList.add('svg-icon', 'lucide-check', SuccessIconCSS);
        saveIndicator.appendChild(saveSuccessIcon);

        // Record auto-save timer
        let autoSaveTimer: number | null = null;
        
        // Auto-save method
        this.autoSaveRootDir = async (value: string) => {
            // Clear previous timer
            if (autoSaveTimer !== null) {
                window.clearTimeout(autoSaveTimer);
            }
            
            // Set new timer, delay 800ms (after user stops typing)
            autoSaveTimer = window.setTimeout(async () => {
                let pathToSave = value.trim();
                if (pathToSave === '') {
                    pathToSave = 'DailyTasks'; // Default storage directory
                }
                
                // Actual save settings
                await this.settingsManager.updateSettings({ rootDir: pathToSave });
                this.dirtySettings = false;
                
                // Show visual feedback for successful save
                saveIndicator.classList.add('save-indicator-visible');
                saveIndicator.classList.remove('save-indicator-hidden');
                window.setTimeout(() => {
                    saveIndicator.classList.remove('save-indicator-visible');
                    saveIndicator.classList.add('save-indicator-hidden');
                }, 1500);
                
            }, 800);
        };

        // Single file path input
        singleFilePathSetting = new Setting(containerEl)
            .setName(getTranslation('settings.singleFilePath'))
            .setDesc(getTranslation('settings.singleFilePath.desc'))
            .addText(text => {
                text.setValue(settings.singleFilePath)
                    .onChange(async (value) => {
                        await this.settingsManager.updateSettings({ singleFilePath: value });
                    });
            });
            
        if (settings.storageMode === StorageMode.SINGLE_FILE) {
            (rootDirSetting as any).settingEl.style.display = 'none';
        } else if (settings.storageMode === StorageMode.BOTH) {
            // Both shown
            (rootDirSetting as any).settingEl.style.display = 'flex';
            (singleFilePathSetting as any).settingEl.style.display = 'flex';
        } else {
            (singleFilePathSetting as any).settingEl.style.display = 'none';
        }
        
        // Language settings
        // TODO: Should use Obsidian API app.i18n.locale to get system language
        // Need to set minAppVersion: "1.8.0" or higher in manifest.json
        // Can remove this setting and modify SettingsManager.getCurrentLanguage()
        new Setting(containerEl)
            .setName(getTranslation('settings.language'))
            .setDesc(getTranslation('settings.language.desc'))
            .addDropdown(dropdown => {
                dropdown
                    .addOption(Language.AUTO, getTranslation('settings.language.auto'))
                    .addOption(Language.ZH, getTranslation('settings.language.zh'))
                    .addOption(Language.EN, getTranslation('settings.language.en'))
                    .addOption(Language.AR, getTranslation('settings.language.ar'))
                    .setValue(settings.language)
                    .onChange(async (value) => {
                        await this.settingsManager.updateSettings({ language: value as Language });
                        // Need to reload settings page to update translations
                        this.display();
                    });
            });

        // Output format (language) settings
        new Setting(containerEl)
            .setName(getTranslation('settings.outputLanguage'))
            .setDesc(getTranslation('settings.outputLanguage.desc'))
            .addDropdown(dropdown => {
                dropdown
                    .addOption(Language.AUTO, getTranslation('settings.language.auto'))
                    .addOption(Language.ZH, getTranslation('settings.language.zh'))
                    .addOption(Language.EN, getTranslation('settings.language.en'))
                    .addOption(Language.AR, getTranslation('settings.language.ar'))
                    .setValue(settings.outputLanguage || Language.AUTO)
                    .onChange(async (value) => {
                        await this.settingsManager.updateSettings({ outputLanguage: value as Language });
                        this.updatePreview(this.previewEl, textarea.getValue());
                    });
            });
        
        // Horizontal line before template settings
        containerEl.createEl('hr', { cls: 'daily-task-divider' });
        
        // Add template variables description
        const templateVariablesEl = document.createElement('div');
        templateVariablesEl.classList.add('template-variables');

        const variablesGrid = document.createElement('div');
        variablesGrid.style.display = 'grid';
        variablesGrid.style.gridTemplateColumns = '1fr 1fr';
        variablesGrid.style.gap = '15px';
        templateVariablesEl.appendChild(variablesGrid);

        const varSection = document.createElement('div');
        const varTitle = document.createElement('div');
        varTitle.style.fontWeight = 'bold';
        varTitle.style.marginBottom = '5px';
        varTitle.textContent = getTranslation('settings.template.variables');
        varSection.appendChild(varTitle);
        const varList = document.createElement('div');
        varList.style.fontSize = '0.85em';
        varList.textContent = getTranslation('settings.template.vars.desc');
        varSection.appendChild(varList);
        variablesGrid.appendChild(varSection);

        const tagSection = document.createElement('div');
        const tagTitle = document.createElement('div');
        tagTitle.style.fontWeight = 'bold';
        tagTitle.style.marginBottom = '5px';
        tagTitle.textContent = getTranslation('settings.template.tags');
        tagSection.appendChild(tagTitle);
        const tagList = document.createElement('div');
        tagList.style.fontSize = '0.85em';
        tagList.textContent = getTranslation('settings.template.tags.desc');
        tagSection.appendChild(tagList);
        variablesGrid.appendChild(tagSection);

        containerEl.appendChild(templateVariablesEl);

        // Single template settings
        const templateSetting = new Setting(containerEl)
            .setName(getTranslation('settings.template'))
            .setClass('template-setting');
        
        const templateContainer = document.createElement('div');
        templateContainer.classList.add('template-container', 'full-width-container');
        
        // Get current template content
        const currentTemplate = this.settingsManager.hasCustomTemplate() ? 
            this.settingsManager.getSettings().customTemplate : 
            this.settingsManager.getTemplateByLanguage();
        
        const textarea = new TextAreaComponent(templateContainer)
            .setValue(currentTemplate)
            .setPlaceholder(this.settingsManager.getCurrentLanguage() === 'zh' ? 
                'Enter task template here...' : 
                'Enter task template here...')
            .onChange(async (value) => {
                // Update to custom template
                await this.settingsManager.updateSettings({ 
                    customTemplate: value,
                    hasCustomTemplate: true
                });
                this.updatePreview(this.previewEl, value);
                
                // Auto resize textarea
                const el = textarea.inputEl;
                el.style.height = 'auto';
                el.style.height = (el.scrollHeight) + 'px';
            });
        
        // Add style classes
        textarea.inputEl.classList.add('template-editor');
        
        // Initial resize
        window.setTimeout(() => {
            const el = textarea.inputEl;
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
        }, 100);
        
        // Preview header, centered using flex layout
        const previewHeader = document.createElement('div');
        previewHeader.classList.add('template-preview-header');
        
        // Preview button container - Left
        const previewBtnContainer = document.createElement('div');
        previewBtnContainer.classList.add('button-container');
        
        // Reset button container - Right
        const resetBtnContainer = document.createElement('div');
        resetBtnContainer.classList.add('button-container');
        
        // Preview button - Improved style
        const toggleButton = new ButtonComponent(previewBtnContainer)
            .setButtonText(getTranslation('settings.template.preview'));
        
        // Add style classes
        toggleButton.buttonEl.addClass(TextCenterCSS);
        toggleButton.buttonEl.addClass('daily-task-button-common');
        toggleButton.buttonEl.addClass('daily-task-button-md');
        
        // Manually add eye icon
        const eyeIcon = document.createElement('span');
        eyeIcon.classList.add('svg-icon', 'lucide-eye');
        toggleButton.buttonEl.prepend(eyeIcon);
        
        // Reset button - Improved style
        const resetBtn = new ButtonComponent(resetBtnContainer)
            .setButtonText(getTranslation('settings.resetDefault'));
        
        // Add style classes
        resetBtn.buttonEl.addClass(TextCenterCSS);
        resetBtn.buttonEl.addClass('daily-task-button-common');
        resetBtn.buttonEl.addClass('daily-task-button-lg');
        
        // Add reset icon
        const resetIcon = document.createElement('span');
        resetIcon.classList.add('svg-icon', 'lucide-refresh-cw');
        resetBtn.buttonEl.prepend(resetIcon);
        
        // Add reset event
        resetBtn.onClick(async () => {
            // Set custom template to empty, revert to default template
            await this.settingsManager.updateSettings({ 
                customTemplate: '',
                hasCustomTemplate: false
            });
            
            // Get default template for current language
            const defaultTemplate = this.settingsManager.getTemplateByLanguage();
            
            // Update input box and preview
            textarea.setValue(defaultTemplate);
            this.updatePreview(this.previewEl, defaultTemplate);
            
            // Show success animation
            resetBtn.buttonEl.classList.add('success-button');
            window.setTimeout(() => {
                resetBtn.buttonEl.classList.remove('success-button');
            }, 1000);
        });

        // Add buttons to their respective containers
        previewHeader.appendChild(previewBtnContainer);
        previewHeader.appendChild(resetBtnContainer);
        templateContainer.appendChild(previewHeader);
        
        // Preview area
        this.previewEl = document.createElement('div');
        this.previewEl.classList.add('template-preview');
        this.updatePreview(this.previewEl, currentTemplate);
        templateContainer.appendChild(this.previewEl);
        
        toggleButton.onClick(() => {
            this.togglePreview(this.previewEl);
            // Toggle icon and button text
            if (this.previewEl && this.previewEl.classList.contains('visible')) {
                eyeIcon.className = 'svg-icon lucide-eye-off';
                toggleButton.setButtonText(getTranslation('settings.template.hide'));
                toggleButton.buttonEl.classList.add('success-button');
            } else {
                eyeIcon.className = 'svg-icon lucide-eye';
                toggleButton.setButtonText(getTranslation('settings.template.preview'));
                toggleButton.buttonEl.classList.remove('success-button');
            }
        });
        
        (templateSetting as any).settingEl.style.display = 'block';
        (templateSetting as any).settingEl.style.borderBottom = 'none';
        (templateSetting as any).settingEl.appendChild(templateContainer);

        // Action buttons container at the bottom
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('daily-task-footer-actions');
        containerEl.appendChild(actionsContainer);
        
        // Restore default settings button
        const resetDefaultBtn = new ButtonComponent(actionsContainer)
            .setButtonText(getTranslation('settings.resetToDefault'));

        // Add style classes
        resetDefaultBtn.buttonEl.addClass(TextCenterCSS);
        resetDefaultBtn.buttonEl.addClass('danger-button');
        resetDefaultBtn.buttonEl.addClass('daily-task-button-common');
        
        // Add reset icon
        const resetIcon2 = document.createElement('span');
        resetIcon2.classList.add('svg-icon', 'lucide-refresh-cw');
        resetDefaultBtn.buttonEl.prepend(resetIcon2);
        
        // Event handler for global reset button
        resetDefaultBtn.onClick(async () => {
            await this.settingsManager.resetToDefaults();
            this.display();
        });
        
        // Manually add today's tasks button
        this.addTaskButton = new ButtonComponent(actionsContainer)
            .setButtonText(getTranslation('settings.addTaskButton'))
            .setCta();

        // Add style classes - Ensure button text is centered
        if (this.addTaskButton && this.addTaskButton.buttonEl) {
            this.addTaskButton.buttonEl.addClass(TextCenterCSS);
            this.addTaskButton.buttonEl.addClass('add-task-button');
            this.addTaskButton.buttonEl.addClass('daily-task-button-common');
            // Remove the margin top as it's now in the container
            this.addTaskButton.buttonEl.style.marginTop = '0';
        }

        // Event handler for manual add task button
        this.addTaskButton.onClick(async () => {
            // Check directory settings
            const rootDir = this.settingsManager.getSettings().rootDir;
            
            // Add loading state
            if (this.addTaskButton && this.addTaskButton.buttonEl) {
                this.addTaskButton.buttonEl.classList.add('loading');
            }
            this.addTaskButton?.setDisabled(true);
            
            try {
                // Add task
                await this.taskGenerator.addTaskManually();
            } catch (e) {
                new Notice(`Add task failed: ${e.message || e}`);
            } finally {
                // Remove loading state
                window.setTimeout(() => {
                    if (this.addTaskButton && this.addTaskButton.buttonEl) {
                        this.addTaskButton.buttonEl.classList.remove('loading');
                    }
                    this.addTaskButton?.setDisabled(false);
                }, 500);
            }
        });

        // Add icon
        const calendarIcon = document.createElement('span');
        calendarIcon.classList.add('svg-icon', 'lucide-calendar-plus');
        this.addTaskButton.buttonEl.prepend(calendarIcon);
    }
    
    /**
     * Update template preview
     */
    private updatePreview(previewEl: HTMLElement | null, template: string): void {
        if (!previewEl) return;
        
        const renderedContent = renderTemplate(template, this.settingsManager.getCurrentOutputLanguage(), true);
        
        previewEl.empty();
        MarkdownRenderer.renderMarkdown(
            renderedContent,
            previewEl,
            '',
            this.plugin as unknown as Component
        );
    }
    
    /**
     * Toggle preview show/hide
     */
    private togglePreview(previewEl: HTMLElement | null): void {
        if (!previewEl) return;
        
        if (previewEl.classList.contains('hidden-element')) {
            previewEl.classList.remove('hidden-element');
            previewEl.classList.add('visible-element', 'visible');
        } else {
            previewEl.classList.add('hidden-element');
            previewEl.classList.remove('visible-element', 'visible');
        }
    }
}

/**
 * Settings Manager
 * Responsible for loading, saving, and providing settings access interface
 */
export class SettingsManager {
    private plugin: Plugin;
    private settings: TaskoratorSettings;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
    }

    /**
     * Get current settings
     */
    getSettings(): TaskoratorSettings {
        return this.settings;
    }

    /**
     * Update settings and save
     * @param settings Settings to update
     */
    async updateSettings(settings: Partial<TaskoratorSettings>): Promise<void> {
        this.settings = {
            ...this.settings,
            ...settings
        };
        await this.saveSettings();
        
        // Update current language
        this.updateCurrentLanguage();
    }

    /**
     * Save settings to data storage
     */
    async saveSettings(): Promise<void> {
        await (this.plugin as TaskoratorPlugin).saveData(this.settings);
    }

    /**
     * Load settings
     */
    async loadSettings(): Promise<void> {
        const loadedData = await (this.plugin as TaskoratorPlugin).loadData();
        if (loadedData) {
            // Merge default settings and saved settings
            this.settings = {
                ...DEFAULT_SETTINGS,
                ...loadedData
            };
            
            // Ensure completeness of settings after plugin upgrade
            this.ensureSettingsCompleteness();
        } else {
            // Use default settings if no data loaded
            this.settings = {
                ...DEFAULT_SETTINGS,
                autoGenerateMode: AutoGenerateMode.DAILY
            };
        }
        
        // Update current language
        this.updateCurrentLanguage();
    }

    /**
     * Ensure settings completeness, provide default values for new items
     */
    private ensureSettingsCompleteness(): void {
        const defaultKeys = Object.keys(DEFAULT_SETTINGS);
        defaultKeys.forEach(key => {
            // Add default value if a setting item is missing
            if (!(key in this.settings)) {
                // Convert object to unknown then to Record<string, unknown>
                ((this.settings as unknown) as Record<string, unknown>)[key] = 
                    ((DEFAULT_SETTINGS as unknown) as Record<string, unknown>)[key];
            }
        });
    }

    /**
     * Restore default settings
     */
    async resetToDefaults(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
        await this.saveSettings();
        
        // Update current language
        this.updateCurrentLanguage();
    }

    /**
     * Get currently used template according to language
     * If custom, no distinction by language
     */
    getCurrentTemplate(): string {
        const language = this.getCurrentLanguage();
        
        // Chinese environment
        if (language === 'zh') {
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateZh;
        } 
        // Arabic environment
        else if (language === 'ar') {
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            return this.settings.templateAr;
        }
        // English environment
        else {
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateEn;
        }
    }
    
    /**
     * Get current language setting
     */
    getCurrentLanguage(): string {
        if (this.settings.language === Language.AUTO) {
            // Automatically detect system language
            const systemLanguage = window.navigator.language.toLowerCase();
            if (systemLanguage.startsWith('zh')) return 'zh';
            if (systemLanguage.startsWith('ar')) return 'ar';
            return 'en';
        }
        return this.settings.language;
    }

    /**
     * Get current output language setting
     */
    getCurrentOutputLanguage(): string {
        if (!this.settings.outputLanguage || this.settings.outputLanguage === Language.AUTO) {
            return this.getCurrentLanguage();
        }
        return this.settings.outputLanguage;
    }
    
    /**
     * Update current language
     */
    private updateCurrentLanguage(): void {
        const language = this.getCurrentLanguage();
        setCurrentLanguage(language);
    }

    /**
     * Get template for the current language
     */
    getTemplateByLanguage(): string {
        const language = this.getCurrentLanguage();
        
        // Chinese environment
        if (language === 'zh') {
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateZh;
        } 
        // Arabic environment
        else if (language === 'ar') {
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            return this.settings.templateAr;
        }
        // English environment
        else {
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateEn;
        }
    }

    /**
     * Check if custom template exists
     */
    hasCustomTemplate(): boolean {
        return !!this.settings.customTemplate;
    }
} 