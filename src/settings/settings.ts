import { App, ButtonComponent, Notice, Plugin, PluginSettingTab, Setting, TextAreaComponent, TextComponent, MarkdownRenderer, Component, setIcon } from 'obsidian';
import { DEFAULT_SETTINGS, TaskoratorSettings, Language, StorageMode, AutoGenerateMode, DEFAULT_TEMPLATE_ZH, DEFAULT_TEMPLATE_EN, DEFAULT_TEMPLATE_AR } from '../models/settings';
import { getTranslation, setCurrentLanguage } from '../i18n/i18n';
import { renderTemplate } from '../utils/templateEngine';
import { TaskGenerator } from '../taskGenerator';
// Import main plugin type definition
import TaskoratorPlugin from '../main';

interface TaskoratorSettingInternal extends Setting {
    nameEl: HTMLElement;
    settingEl: HTMLElement;
    controlEl: HTMLElement;
    infoEl: HTMLElement;
    descEl: HTMLElement;
}

// CSS related constants (class names) - Remove unused ones
const InputContainerCSS = "daily-task-input-container";
const TextCenterCSS = "daily-task-text-center";
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
    autoSaveRootDir: (value: string) => void;

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
        
        // Add main title as heading
        new Setting(containerEl).setName(getTranslation('settings.title')).setHeading();

        // 设置RTL支持
        if (this.settingsManager.getCurrentLanguage() === 'ar') {
            containerEl.classList.add('daily-task-rtl');
        } else {
            containerEl.classList.remove('daily-task-rtl');
        }

        // Output mode settings
        let singleFilePathSetting: TaskoratorSettingInternal | null = null;
        let rootDirSetting: TaskoratorSettingInternal | null = null;
        
        const storageModeSetting = new Setting(containerEl)
            .setDesc(getTranslation('settings.outputMode.desc')) as TaskoratorSettingInternal;
        
        const storageModeNameEl = storageModeSetting.nameEl;
        storageModeNameEl.empty();
        setIcon(storageModeNameEl, 'archive');
        storageModeNameEl.createSpan({ text: ' ' + getTranslation('settings.outputMode') });

        storageModeSetting.addDropdown(dropdown => {
                dropdown
                    .addOption(StorageMode.TRADITIONAL, getTranslation('settings.outputMode.traditional'))
                    .addOption(StorageMode.SINGLE_FILE, getTranslation('settings.outputMode.singleFile'))
                    .addOption(StorageMode.BOTH, getTranslation('settings.outputMode.both'))
                    .setValue(settings.storageMode)
                    .onChange((value) => {
                        if (singleFilePathSetting && rootDirSetting) {
                            if (value === StorageMode.SINGLE_FILE) {
                                singleFilePathSetting.settingEl.classList.remove('u-display-none');
                                singleFilePathSetting.settingEl.classList.add('u-display-flex');
                                rootDirSetting.settingEl.classList.add('u-display-none');
                                rootDirSetting.settingEl.classList.remove('u-display-flex');
                            } else if (value === StorageMode.BOTH) {
                                singleFilePathSetting.settingEl.classList.remove('u-display-none');
                                singleFilePathSetting.settingEl.classList.add('u-display-flex');
                                rootDirSetting.settingEl.classList.remove('u-display-none');
                                rootDirSetting.settingEl.classList.add('u-display-flex');
                            } else {
                                singleFilePathSetting.settingEl.classList.add('u-display-none');
                                singleFilePathSetting.settingEl.classList.remove('u-display-flex');
                                rootDirSetting.settingEl.classList.remove('u-display-none');
                                rootDirSetting.settingEl.classList.add('u-display-flex');
                            }
                        }
                        void this.settingsManager.updateSettings({ storageMode: value as StorageMode });
                    });
            });

        // Root directory settings
        rootDirSetting = new Setting(containerEl)
            .setDesc(getTranslation('settings.rootDir.desc')) as TaskoratorSettingInternal;
        
        const rootDirNameEl = rootDirSetting.nameEl;
        rootDirNameEl.empty();
        setIcon(rootDirNameEl, 'folder');
        rootDirNameEl.createSpan({ text: ' ' + getTranslation('settings.rootDir') });
            
        // Create input container to allow extra elements
        const inputContainer = document.createElement('div');
        inputContainer.classList.add(InputContainerCSS);
        rootDirSetting.controlEl.appendChild(inputContainer);
        
        this.rootDirInput = new TextComponent(inputContainer)
            .setValue(settings.rootDir)
            .onChange((value) => {
                if (value.trim() !== '') {
                    // Settings changed, prepare for auto-save
                    this.dirtySettings = true;
                    
                    // Start auto-save timer
                    this.autoSaveRootDir(value);
                }
            });
        
        // Set class and placeholder attributes for input element
        if (this.rootDirInput && this.rootDirInput.inputEl) {
            this.rootDirInput.inputEl.placeholder = 'DailyTasks';
        }
        
        // Record auto-save timer
        let autoSaveTimer: number | null = null;
        
        // Auto-save method
        this.autoSaveRootDir = (value: string) => {
            // Clear previous timer
            if (autoSaveTimer !== null) {
                window.clearTimeout(autoSaveTimer);
            }
            
            // Set new timer, delay 800ms (after user stops typing)
            autoSaveTimer = window.setTimeout(() => {
                let pathToSave = value.trim();
                if (pathToSave === '') {
                    pathToSave = 'DailyTasks'; // Default storage directory
                }
                
                // Actual save settings
                void this.settingsManager.updateSettings({ rootDir: pathToSave }).then(() => {
                    this.dirtySettings = false;
                });
            }, 800);
        };

        // Single file path input
        singleFilePathSetting = new Setting(containerEl)
            .setDesc(getTranslation('settings.singleFilePath.desc')) as TaskoratorSettingInternal;
        
        const singleFilePathNameEl = singleFilePathSetting.nameEl;
        singleFilePathNameEl.empty();
        setIcon(singleFilePathNameEl, 'file-text');
        singleFilePathNameEl.createSpan({ text: ' ' + getTranslation('settings.singleFilePath') });

        singleFilePathSetting.addText(text => {
                text.setValue(settings.singleFilePath)
                    .onChange((value) => {
                        void this.settingsManager.updateSettings({ singleFilePath: value });
                    });
            });
            
        if (settings.storageMode === StorageMode.SINGLE_FILE) {
            rootDirSetting.settingEl.classList.add('u-display-none');
            rootDirSetting.settingEl.classList.remove('u-display-flex');
        } else if (settings.storageMode === StorageMode.BOTH) {
            // Both shown
            rootDirSetting.settingEl.classList.add('u-display-flex');
            rootDirSetting.settingEl.classList.remove('u-display-none');
            singleFilePathSetting.settingEl.classList.add('u-display-flex');
            singleFilePathSetting.settingEl.classList.remove('u-display-none');
        } else {
            singleFilePathSetting.settingEl.classList.add('u-display-none');
            singleFilePathSetting.settingEl.classList.remove('u-display-flex');
        }

        // Language settings (Interface)
        const languageSetting = new Setting(containerEl)
            .setDesc(getTranslation('settings.language.desc')) as TaskoratorSettingInternal;
        
        const languageNameEl = languageSetting.nameEl;
        languageNameEl.empty();
        setIcon(languageNameEl, 'languages');
        languageNameEl.createSpan({ text: ' ' + getTranslation('settings.language') });

        languageSetting.addDropdown(dropdown => {
                dropdown
                    .addOption(Language.AUTO, getTranslation('settings.language.auto'))
                    .addOption(Language.ZH, getTranslation('settings.language.zh'))
                    .addOption(Language.EN, getTranslation('settings.language.en'))
                    .addOption(Language.AR, getTranslation('settings.language.ar'))
                    .setValue(settings.language)
                    .onChange((value) => {
                        void this.settingsManager.updateSettings({ language: value as Language }).then(() => {
                            // Need to reload settings page to update translations
                            this.display();
                        });
                    });
            });

        // Output format (language) settings - Last before divider
        const outputLanguageSetting = new Setting(containerEl)
            .setDesc(getTranslation('settings.outputLanguage.desc')) as TaskoratorSettingInternal;
        
        const outputLanguageNameEl = outputLanguageSetting.nameEl;
        outputLanguageNameEl.empty();
        setIcon(outputLanguageNameEl, 'globe');
        outputLanguageNameEl.createSpan({ text: ' ' + getTranslation('settings.outputLanguage') });

        outputLanguageSetting.addDropdown(dropdown => {
                dropdown
                    .addOption(Language.AUTO, getTranslation('settings.language.auto'))
                    .addOption(Language.ZH, getTranslation('settings.language.zh'))
                    .addOption(Language.EN, getTranslation('settings.language.en'))
                    .addOption(Language.AR, getTranslation('settings.language.ar'))
                    .setValue(settings.outputLanguage || Language.AUTO)
                    .onChange((value) => {
                        void this.settingsManager.updateSettings({ outputLanguage: value as Language }).then(() => {
                            const template = this.settingsManager.hasCustomTemplate() ? 
                                this.settingsManager.getSettings().customTemplate : 
                                this.settingsManager.getTemplateByLanguage();
                            this.updatePreview(this.previewEl, template);
                        });
                    });
            });
        
        // Horizontal line before template settings
        containerEl.createEl('hr', { cls: 'daily-task-divider' });
        
        // Add templates section heading
        new Setting(containerEl).setName(getTranslation('settings.templateSettings')).setHeading();

        // Add template variables description
        const templateVariablesEl = document.createElement('div');
        templateVariablesEl.classList.add('template-variables');

        const variablesGrid = document.createElement('div');
        variablesGrid.classList.add('template-variables-grid');
        templateVariablesEl.appendChild(variablesGrid);

        const varSection = document.createElement('div');
        const varTitle = document.createElement('div');
        varTitle.classList.add('template-variable-section-title');
        varTitle.textContent = getTranslation('settings.template.variables');
        varSection.appendChild(varTitle);
        const varList = document.createElement('div');
        varList.classList.add('template-variable-section-list');
        varList.textContent = getTranslation('settings.template.vars.desc');
        varSection.appendChild(varList);
        variablesGrid.appendChild(varSection);

        const tagSection = document.createElement('div');
        const tagTitle = document.createElement('div');
        tagTitle.classList.add('template-variable-section-title');
        tagTitle.textContent = getTranslation('settings.template.tags');
        tagSection.appendChild(tagTitle);
        const tagList = document.createElement('div');
        tagList.classList.add('template-variable-section-list');
        tagList.textContent = getTranslation('settings.template.tags.desc');
        tagSection.appendChild(tagList);
        variablesGrid.appendChild(tagSection);

        containerEl.appendChild(templateVariablesEl);

        // Single template settings
        const templateSetting = new Setting(containerEl)
            .setClass('template-setting') as TaskoratorSettingInternal;
        
        const templateNameEl = templateSetting.nameEl;
        templateNameEl.empty();
        setIcon(templateNameEl, 'file-code');
        templateNameEl.createSpan({ text: ' ' + getTranslation('settings.template') });
        
        const templateContainer = document.createElement('div');
        templateContainer.classList.add('template-container', 'full-width-container');
        
        // Get current template content
        const currentTemplate = this.settingsManager.hasCustomTemplate() ? 
            this.settingsManager.getSettings().customTemplate : 
            this.settingsManager.getTemplateByLanguage();
        
        // Create tabs for the template editor
        const tabsContainer = document.createElement('div');
        tabsContainer.classList.add('template-tabs-container');
        templateContainer.appendChild(tabsContainer);

        const manualTab = document.createElement('div');
        manualTab.classList.add('template-tab', 'active');
        setIcon(manualTab, 'pencil');
        manualTab.appendChild(document.createTextNode(' ' + (getTranslation('settings.template.manual') || 'Manual Input')));
        tabsContainer.appendChild(manualTab);

        const graphicalTab = document.createElement('div');
        graphicalTab.classList.add('template-tab');
        setIcon(graphicalTab, 'wand-2');
        graphicalTab.appendChild(document.createTextNode(' ' + (getTranslation('settings.template.graphical') || 'Graphical Input')));
        tabsContainer.appendChild(graphicalTab);

        // Content areas
        const manualContent = document.createElement('div');
        manualContent.classList.add('template-tab-content', 'active');
        templateContainer.appendChild(manualContent);

        const graphicalContent = document.createElement('div');
        graphicalContent.classList.add('template-tab-content');
        templateContainer.appendChild(graphicalContent);

        const textarea = new TextAreaComponent(manualContent);
        
        // Graphical editor placeholder
        const graphicalPlaceholder = document.createElement('div');
        graphicalPlaceholder.classList.add('graphical-placeholder');
        const graphicalIcon = document.createElement('div');
        graphicalIcon.classList.add('graphical-icon');
        setIcon(graphicalIcon, 'wand-2');
        graphicalPlaceholder.appendChild(graphicalIcon);
        const graphicalText = document.createElement('p');
        graphicalText.textContent = getTranslation('settings.template.graphical.desc') || 'Graphical builder coming soon... Use manual input for now.';
        graphicalPlaceholder.appendChild(graphicalText);
        graphicalContent.appendChild(graphicalPlaceholder);

        // Tab switching logic
        manualTab.onclick = () => {
            manualTab.classList.add('active');
            graphicalTab.classList.remove('active');
            manualContent.classList.add('active');
            graphicalContent.classList.remove('active');
        };

        graphicalTab.onclick = () => {
            graphicalTab.classList.add('active');
            manualTab.classList.remove('active');
            graphicalContent.classList.add('active');
            manualContent.classList.remove('active');
        };

        textarea
            .setValue(currentTemplate)
            .setPlaceholder(getTranslation('settings.template.placeholder') || 'Enter task template here...')
            .onChange((value) => {
                // Update to custom template
                void this.settingsManager.updateSettings({ 
                    customTemplate: value,
                    hasCustomTemplate: true
                });
                this.updatePreview(this.previewEl, value);
                
                // Auto resize textarea
                const el = textarea.inputEl;
                el.style.height = 'auto';
                const newHeight = Math.max(el.scrollHeight, 250);
                el.style.height = newHeight + 'px';
            });
        
        // Add style classes
        textarea.inputEl.classList.add('template-editor');
        
        // Initial resize
        window.setTimeout(() => {
            const el = textarea.inputEl;
            if (el) {
                el.style.height = 'auto';
                const newHeight = Math.max(el.scrollHeight, 250);
                el.style.height = newHeight + 'px';
            }
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
        setIcon(eyeIcon, 'eye');
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
        setIcon(resetIcon, 'refresh-cw');
        resetBtn.buttonEl.prepend(resetIcon);
        
        // Add reset event
        resetBtn.onClick(() => {
            // Set custom template to empty, revert to default template
            void this.settingsManager.updateSettings({ 
                customTemplate: '',
                hasCustomTemplate: false
            }).then(() => {
                // Get default template for current language
                const defaultTemplate = this.settingsManager.getTemplateByLanguage();
                
                // Update input box and preview
                textarea.setValue(defaultTemplate);
                this.updatePreview(this.previewEl, defaultTemplate);
                
                // Auto resize textarea after reset
                const el = textarea.inputEl;
                if (el) {
                    el.style.height = 'auto';
                    const newHeight = Math.max(el.scrollHeight, 250);
                    el.style.height = newHeight + 'px';
                }
                
                // Show success animation
                resetBtn.buttonEl.classList.add('success-button');
                window.setTimeout(() => {
                    resetBtn.buttonEl.classList.remove('success-button');
                }, 1000);
            });
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
                setIcon(eyeIcon, 'eye-off');
                toggleButton.setButtonText(getTranslation('settings.template.hide'));
                toggleButton.buttonEl.classList.add('success-button');
            } else {
                setIcon(eyeIcon, 'eye');
                toggleButton.setButtonText(getTranslation('settings.template.preview'));
                toggleButton.buttonEl.classList.remove('success-button');
            }
        });
        
        templateSetting.settingEl.classList.add('template-setting-block');
        templateSetting.settingEl.classList.add('template-setting-no-border');
        templateSetting.settingEl.appendChild(templateContainer);

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
        setIcon(resetIcon2, 'refresh-cw');
        resetDefaultBtn.buttonEl.prepend(resetIcon2);
        
        // Event handler for global reset button
        resetDefaultBtn.onClick(() => {
            void this.settingsManager.resetToDefaults().then(() => {
                this.display();
            });
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
        }

        // Event handler for manual add task button
        this.addTaskButton.onClick(() => {
            // Check directory settings
            // const rootDir = this.settingsManager.getSettings().rootDir;
            
            // Add loading state
            if (this.addTaskButton && this.addTaskButton.buttonEl) {
                this.addTaskButton.buttonEl.classList.add('loading');
            }
            this.addTaskButton?.setDisabled(true);
            
            void this.taskGenerator.addTaskManually()
                .catch((e) => {
                    new Notice(`Add task failed: ${e.message || e}`);
                })
                .finally(() => {
                    // Remove loading state
                    window.setTimeout(() => {
                        if (this.addTaskButton && this.addTaskButton.buttonEl) {
                            this.addTaskButton.buttonEl.classList.remove('loading');
                        }
                        this.addTaskButton?.setDisabled(false);
                    }, 500);
                });
        });

        // Add icon
        const calendarIcon = document.createElement('span');
        setIcon(calendarIcon, 'calendar-plus');
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
        previewEl.classList.toggle('visible');
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
        } as TaskoratorSettings;
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
        const loadedData = await (this.plugin as TaskoratorPlugin).loadData() as Partial<TaskoratorSettings> | null;
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