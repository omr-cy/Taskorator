// @ts-ignore
import { App, ButtonComponent, DropdownComponent, Notice, Plugin, PluginSettingTab, Setting, TextAreaComponent, TextComponent, ToggleComponent, MarkdownRenderer, Component } from 'obsidian';
import { AutoGenerateMode, DEFAULT_SETTINGS, DEFAULT_TEMPLATE_EN, DEFAULT_TEMPLATE_ZH, DEFAULT_TEMPLATE_AR, TaskoratorSettings, Language, StorageMode } from '../models/settings';
import { getTranslation, setCurrentLanguage } from '../i18n/i18n';
import { renderTemplate } from '../utils/templateEngine';
import { TaskGenerator } from '../taskGenerator';
import { setTextContentByLines, createIconButton, createTextElement } from '../utils/domUtils';
// 导入主插件类型定义
import TaskoratorPlugin from '../main';

// CSS 相关常量（class名称）
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
 * 添加插件自定义样式
 * 注意：样式内容现在已移至外部CSS文件
 */
function addCustomStyles() {
    // 样式已移至src/styles.css，无需在此处添加内联样式
    // 插件加载时会自动加载styles.css文件
}

/**
 * 插件设置标签页
 */
export class TaskoratorSettingTab extends PluginSettingTab {
    plugin: Plugin;
    settingsManager: SettingsManager;
    taskGenerator: TaskGenerator;
    previewEl: HTMLElement | null = null;
    addTaskButton: ButtonComponent | null = null;
    
    // 目录输入框
    rootDirInput: TextComponent | null = null;
    
    // 标记设置是否已修改但未保存
    dirtySettings: boolean = false;
    
    // 自动保存目录的方法
    autoSaveRootDir: (value: string) => Promise<void>;

    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
        
        // 获取父插件中的设置管理器引用 - 使用类型断言为TaskoratorPlugin而不是any
        this.settingsManager = (plugin as TaskoratorPlugin).settingsManager;
        
        // 创建任务生成器
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
        
        // 输出模式设置
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

        // 根目录设置
        rootDirSetting = new Setting(containerEl)
            .setName(getTranslation('settings.rootDir'))
            .setDesc(getTranslation('settings.rootDir.desc'));
            
        // 创建输入框容器，使其可以包含额外元素
        const inputContainer = document.createElement('div');
        inputContainer.classList.add(InputContainerCSS);
        rootDirSetting.controlEl.appendChild(inputContainer);
        
        this.rootDirInput = new TextComponent(inputContainer)
            .setValue(settings.rootDir)
            .onChange(async (value) => {
                if (value.trim() !== '') {
                    // 设置已更改，准备自动保存
                    this.dirtySettings = true;
                    
                    // 启动自动保存定时器
                    this.autoSaveRootDir(value);
                }
            });
        
        // 给input元素设置类和placeholder属性
        if (this.rootDirInput && this.rootDirInput.inputEl) {
            this.rootDirInput.inputEl.classList.add(InputCSS);
            this.rootDirInput.inputEl.placeholder = 'DailyTasks';
        }
        
        // 添加自动保存指示器
        const saveIndicator = document.createElement('div');
        saveIndicator.classList.add(SaveIndicatorCSS);
        inputContainer.appendChild(saveIndicator);
        
        // 创建保存成功图标
        const saveSuccessIcon = document.createElement('span');
        saveSuccessIcon.classList.add('svg-icon', 'lucide-check', SuccessIconCSS);
        saveIndicator.appendChild(saveSuccessIcon);

        // 记录自动保存定时器
        let autoSaveTimer: number | null = null;
        
        // 自动保存方法
        this.autoSaveRootDir = async (value: string) => {
            // 清除之前的定时器
            if (autoSaveTimer !== null) {
                window.clearTimeout(autoSaveTimer);
            }
            
            // 设置新的定时器，延迟800ms保存（在用户停止输入后）
            autoSaveTimer = window.setTimeout(async () => {
                let pathToSave = value.trim();
                if (pathToSave === '') {
                    pathToSave = 'DailyTasks'; // 默认存放目录
                }
                
                // 实际保存设置
                await this.settingsManager.updateSettings({ rootDir: pathToSave });
                this.dirtySettings = false;
                
                // 显示保存成功的视觉反馈
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
        
        // 语言设置
        // TODO: 应该使用Obsidian API的app.i18n.locale获取系统语言设置
        // 需要在manifest.json中设置minAppVersion: "1.8.0"或更高
        // 可以移除此设置并修改SettingsManager.getCurrentLanguage()方法
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
                        // 需要重新加载设置页面以更新翻译
                        this.display();
                    });
            });
        
        // Horizontal line before template settings
        containerEl.createEl('hr', { cls: 'daily-task-divider' });
        
        // 添加模板变量说明
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
        
        // 单一模板设置
        const templateSetting = new Setting(containerEl)
            .setName(getTranslation('settings.template'))
            .setClass('template-setting');
        
        const templateContainer = document.createElement('div');
        templateContainer.classList.add('template-container', 'full-width-container');
        
        // 获取当前模板内容
        const currentTemplate = this.settingsManager.hasCustomTemplate() ? 
            this.settingsManager.getSettings().customTemplate : 
            this.settingsManager.getTemplateByLanguage();
        
        const textarea = new TextAreaComponent(templateContainer)
            .setValue(currentTemplate)
            .setPlaceholder(this.settingsManager.getCurrentLanguage() === 'zh' ? 
                '在此处输入任务模板...' : 
                'Enter task template here...')
            .onChange(async (value) => {
                // 更新为自定义模板
                await this.settingsManager.updateSettings({ 
                    customTemplate: value,
                    hasCustomTemplate: true
                });
                this.updatePreview(this.previewEl, value);
            });
        
        // 添加样式类
        textarea.inputEl.classList.add('template-editor');
        
        // 预览标题，使用flex布局居中
        const previewHeader = document.createElement('div');
        previewHeader.classList.add('template-preview-header');
        
        // 预览按钮容器 - 左侧
        const previewBtnContainer = document.createElement('div');
        previewBtnContainer.classList.add('button-container');
        
        // 重置按钮容器 - 右侧
        const resetBtnContainer = document.createElement('div');
        resetBtnContainer.classList.add('button-container');
        
        // 预览按钮 - 改进样式
        const toggleButton = new ButtonComponent(previewBtnContainer)
            .setButtonText(getTranslation('settings.template.preview'));
        
        // 添加样式类
        toggleButton.buttonEl.addClass(TextCenterCSS);
        toggleButton.buttonEl.addClass('daily-task-button-common');
        toggleButton.buttonEl.addClass('daily-task-button-md');
        
        // 手动添加眼睛图标
        const eyeIcon = document.createElement('span');
        eyeIcon.classList.add('svg-icon', 'lucide-eye');
        toggleButton.buttonEl.prepend(eyeIcon);
        
        // 重置按钮 - 改进样式
        const resetBtn = new ButtonComponent(resetBtnContainer)
            .setButtonText(getTranslation('settings.resetDefault'));
        
        // 添加样式类
        resetBtn.buttonEl.addClass(TextCenterCSS);
        resetBtn.buttonEl.addClass('daily-task-button-common');
        resetBtn.buttonEl.addClass('daily-task-button-lg');
        
        // 添加重置图标
        const resetIcon = document.createElement('span');
        resetIcon.classList.add('svg-icon', 'lucide-refresh-cw');
        resetBtn.buttonEl.prepend(resetIcon);
        
        // 添加重置事件
        resetBtn.onClick(async () => {
            // 将自定义模板设置为空，回到使用默认模板
            await this.settingsManager.updateSettings({ 
                customTemplate: '',
                hasCustomTemplate: false
            });
            
            // 获取当前语言的默认模板
            const defaultTemplate = this.settingsManager.getTemplateByLanguage();
            
            // 更新输入框和预览
            textarea.setValue(defaultTemplate);
            this.updatePreview(this.previewEl, defaultTemplate);
            
            // 显示成功提示动画
            resetBtn.buttonEl.classList.add('success-button');
            window.setTimeout(() => {
                resetBtn.buttonEl.classList.remove('success-button');
            }, 1000);
        });

        // 将按钮添加到各自的容器
        previewHeader.appendChild(previewBtnContainer);
        previewHeader.appendChild(resetBtnContainer);
        templateContainer.appendChild(previewHeader);
        
        // 预览区域
        this.previewEl = document.createElement('div');
        this.previewEl.classList.add('template-preview');
        this.updatePreview(this.previewEl, currentTemplate);
        templateContainer.appendChild(this.previewEl);
        
        toggleButton.onClick(() => {
            this.togglePreview(this.previewEl);
            // 切换图标和按钮文本
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

        // 恢复默认设置 - 创建容器让按钮右对齐
        const resetContainer = document.createElement('div');
        resetContainer.classList.add('button-container');
        containerEl.appendChild(resetContainer);
        
        // 恢复默认设置按钮
        const resetDefaultBtn = new ButtonComponent(resetContainer)
            .setButtonText(getTranslation('settings.resetToDefault'));

        // 添加样式类
        resetDefaultBtn.buttonEl.addClass(TextCenterCSS);
        resetDefaultBtn.buttonEl.addClass('danger-button');
        resetDefaultBtn.buttonEl.addClass('daily-task-button-common');
        resetDefaultBtn.buttonEl.addClass('daily-task-button-lg');
        
        // 添加重置图标
        const resetIcon2 = document.createElement('span');
        resetIcon2.classList.add('svg-icon', 'lucide-refresh-cw');
        resetDefaultBtn.buttonEl.prepend(resetIcon2);
        
        // 为全局重置按钮添加事件处理
        resetDefaultBtn.onClick(async () => {
            await this.settingsManager.resetToDefaults();
            this.display();
        });
        
        // 手动添加今日任务按钮 - 右对齐显示
        const addTaskContainer = document.createElement('div');
        addTaskContainer.classList.add('button-container');
        containerEl.appendChild(addTaskContainer);
        
        this.addTaskButton = new ButtonComponent(addTaskContainer)
            .setButtonText(getTranslation('settings.addTaskButton'))
            .setCta();

        // 添加样式类 - 确保按钮文字居中
        if (this.addTaskButton && this.addTaskButton.buttonEl) {
            this.addTaskButton.buttonEl.addClass(TextCenterCSS);
            this.addTaskButton.buttonEl.addClass('daily-task-button-common');
        }

        // 手动添加任务按钮事件处理
        this.addTaskButton.onClick(async () => {
            // 检查目录设置
            const rootDir = this.settingsManager.getSettings().rootDir;
            
            // 添加loading状态
            if (this.addTaskButton && this.addTaskButton.buttonEl) {
                this.addTaskButton.buttonEl.classList.add('loading');
            }
            this.addTaskButton?.setDisabled(true);
            
            try {
                // 添加任务
                await this.taskGenerator.addTaskManually();
            } catch (e) {
                new Notice(`添加任务失败: ${e.message || e}`);
            } finally {
                // 移除loading状态
                window.setTimeout(() => {
                    if (this.addTaskButton && this.addTaskButton.buttonEl) {
                        this.addTaskButton.buttonEl.classList.remove('loading');
                    }
                    this.addTaskButton?.setDisabled(false);
                }, 500);
            }
        });

        // 添加图标
        const calendarIcon = document.createElement('span');
        calendarIcon.classList.add('svg-icon', 'lucide-calendar-plus');
        this.addTaskButton.buttonEl.prepend(calendarIcon);
    }
    
    /**
     * 更新模板预览
     */
    private updatePreview(previewEl: HTMLElement | null, template: string): void {
        if (!previewEl) return;
        
        const renderedContent = renderTemplate(template);
        
        previewEl.empty();
        MarkdownRenderer.renderMarkdown(
            renderedContent,
            previewEl,
            '',
            this.plugin as unknown as Component
        );
    }
    
    /**
     * 切换预览的显示/隐藏
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
 * 设置管理器
 * 负责加载、保存和提供设置访问接口
 */
export class SettingsManager {
    private plugin: Plugin;
    private settings: TaskoratorSettings;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
    }

    /**
     * 获取当前设置
     */
    getSettings(): TaskoratorSettings {
        return this.settings;
    }

    /**
     * 更新设置并保存
     * @param settings 要更新的设置
     */
    async updateSettings(settings: Partial<TaskoratorSettings>): Promise<void> {
        this.settings = {
            ...this.settings,
            ...settings
        };
        await this.saveSettings();
        
        // 更新当前语言
        this.updateCurrentLanguage();
    }

    /**
     * 保存设置到数据存储
     */
    async saveSettings(): Promise<void> {
        await (this.plugin as TaskoratorPlugin).saveData(this.settings);
    }

    /**
     * 加载设置
     */
    async loadSettings(): Promise<void> {
        const loadedData = await (this.plugin as TaskoratorPlugin).loadData();
        if (loadedData) {
            // 合并默认设置和已保存的设置
            this.settings = {
                ...DEFAULT_SETTINGS,
                ...loadedData
            };
            
            // 确保在升级插件后，新增的设置项也有默认值
            this.ensureSettingsCompleteness();
        } else {
            // 如果没有加载到数据，使用默认设置
            this.settings = {
                ...DEFAULT_SETTINGS,
                autoGenerateMode: AutoGenerateMode.DAILY
            };
        }
        
        // 更新当前语言
        this.updateCurrentLanguage();
    }

    /**
     * 确保设置完整性，为新增的设置项提供默认值
     */
    private ensureSettingsCompleteness(): void {
        const defaultKeys = Object.keys(DEFAULT_SETTINGS);
        defaultKeys.forEach(key => {
            // 如果当前设置中缺少某个默认设置项，添加默认值
            if (!(key in this.settings)) {
                // 先将对象转换为unknown，再转换为Record<string, unknown>
                ((this.settings as unknown) as Record<string, unknown>)[key] = 
                    ((DEFAULT_SETTINGS as unknown) as Record<string, unknown>)[key];
            }
        });
    }

    /**
     * 恢复默认设置
     */
    async resetToDefaults(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
        await this.saveSettings();
        
        // 更新当前语言
        this.updateCurrentLanguage();
    }

    /**
     * 根据语言获取当前使用的模板
     * 如果当前模板不是默认模板，则不再区分语言
     */
    getCurrentTemplate(): string {
        const language = this.getCurrentLanguage();
        
        // 中文环境
        if (language === 'zh') {
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateZh;
        } 
        // 阿拉伯语环境
        else if (language === 'ar') {
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            return this.settings.templateAr;
        }
        // 英文环境
        else {
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateEn;
        }
    }
    
    /**
     * 获取当前语言设置
     */
    getCurrentLanguage(): string {
        if (this.settings.language === Language.AUTO) {
            // 自动检测系统语言
            const systemLanguage = window.navigator.language.toLowerCase();
            if (systemLanguage.startsWith('zh')) return 'zh';
            if (systemLanguage.startsWith('ar')) return 'ar';
            return 'en';
        }
        return this.settings.language;
    }
    
    /**
     * 更新当前语言
     */
    private updateCurrentLanguage(): void {
        const language = this.getCurrentLanguage();
        setCurrentLanguage(language);
    }

    /**
     * 获取当前语言的模板
     */
    getTemplateByLanguage(): string {
        const language = this.getCurrentLanguage();
        
        // 中文环境
        if (language === 'zh') {
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateZh;
        } 
        // 阿拉伯语环境
        else if (language === 'ar') {
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            return this.settings.templateAr;
        }
        // 英文环境
        else {
            if (this.settings.templateEn !== DEFAULT_TEMPLATE_EN) return this.settings.templateEn;
            if (this.settings.templateZh !== DEFAULT_TEMPLATE_ZH) return this.settings.templateZh;
            if (this.settings.templateAr !== DEFAULT_TEMPLATE_AR) return this.settings.templateAr;
            return this.settings.templateEn;
        }
    }

    /**
     * 检查是否存在自定义模板
     */
    hasCustomTemplate(): boolean {
        return !!this.settings.customTemplate;
    }
} 