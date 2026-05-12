/**
 * i18n.ts
 * Internationalization Support Module
 */

// Define translation key types
export type TranslationKey = 
    // Setting Page
    | 'settings.title'
    | 'settings.rootDir'
    | 'settings.rootDir.desc'
    | 'settings.rootDir.saved'
    | 'settings.save'
    | 'settings.autoGenerate'
    | 'settings.autoGenerate.desc'
    | 'settings.mode.none'
    | 'settings.mode.daily'
    | 'settings.mode.workday'
    | 'settings.language'
    | 'settings.language.desc'
    | 'settings.language.auto'
    | 'settings.language.zh'
    | 'settings.language.en'
    | 'settings.language.ar'
    | 'settings.animations'
    | 'settings.animations.desc'
    | 'settings.template'
    | 'settings.template.zh'
    | 'settings.template.en'
    | 'settings.template.ar'
    | 'settings.template.preview'
    | 'settings.template.hide'
    | 'settings.resetDefault'
    | 'settings.addTaskButton'
    | 'settings.resetToDefault'
    | 'settings.preview'
    | 'template.dateWithIcon'
    | 'settings.basicSettings'
    | 'settings.templateSettings'
    
    | 'settings.template.variables'
    | 'settings.template.tags'
    | 'settings.template.tags.desc'
    | 'settings.template.vars.desc'
    
    // Output Mode
    | 'settings.outputMode'
    | 'settings.outputMode.desc'
    | 'settings.outputMode.traditional'
    | 'settings.outputMode.singleFile'
    | 'settings.outputMode.both'
    | 'settings.outputLanguage'
    | 'settings.outputLanguage.desc'
    | 'settings.singleFilePath'
    | 'settings.singleFilePath.desc'
    
    // Commands
    | 'commands.addDailyTask'
    
    // Notifications
    | 'notification.taskAdded'
    | 'notification.taskExists'
    | 'notification.error'
    | 'notification.generating'
    
    // Weekdays
    | 'weekday.mon'
    | 'weekday.tue'
    | 'weekday.wed'
    | 'weekday.thu'
    | 'weekday.fri'
    | 'weekday.sat'
    | 'weekday.sun'
    
    // Plugin name and description
    | 'plugin.name'
    | 'plugin.description'
    
    // General buttons and messages
    | 'button.addTask'
    | 'button.save'
    | 'button.cancel'
    | 'button.done';

// Chinese translation
const translationsZH: Record<TranslationKey, string> = {
    'settings.title': 'Taskorator 设置',
    'settings.rootDir': '📁 任务文件存放目录',
    'settings.rootDir.desc': '指定保存任务文件的根目录，任务将按"年份/月份.md"格式存储',
    'settings.rootDir.saved': '✓ 目录已保存',
    'settings.save': '💾 保存',
    'settings.autoGenerate': '🔄 自动生成模式',
    'settings.autoGenerate.desc': '选择何时自动生成每日任务',
    'settings.mode.none': '❌ 关闭',
    'settings.mode.daily': '📆 每天',
    'settings.mode.workday': '💼 仅工作日',
    'settings.language': '🔤 界面语言',
    'settings.language.desc': '选择插件界面显示的语言',
    'settings.language.auto': '🔍 自动检测',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.ar': 'العربية',
    'settings.animations': '✨ 动画效果',
    'settings.animations.desc': '启用界面动画效果',
    'settings.template': '📝 任务模板',
    'settings.template.zh': '中文模板',
    'settings.template.en': 'English 模板',
    'settings.template.ar': 'العربية 模板',
    'settings.template.preview': '👁️ 显示预览',
    'settings.template.hide': '👁️‍🗨️ 隐藏预览',
    'settings.resetToDefault': '恢复默认设置',
    'settings.addTaskButton': '➕ 手动添加今日任务',
    'settings.preview': '预览模板效果',
    'settings.resetDefault': '恢复默认设置',
    'template.dateWithIcon': '带图标的当前日期',
    'settings.basicSettings': '基本设置',
    'settings.templateSettings': '模板设置',
    'settings.outputMode': '📤 输出模式',
    'settings.outputMode.desc': '选择按月归档、覆盖单一文件，或两者同时进行',
    'settings.outputMode.traditional': '📂 按月归档',
    'settings.outputMode.singleFile': '📄 覆盖单一文件',
    'settings.outputMode.both': '🔄 两者同时进行',
    'settings.outputLanguage': '📄 输出格式 (语言)',
    'settings.outputLanguage.desc': '选择生成的任务笔记中日期和星期的显示语言',
    'settings.singleFilePath': '📝 单一任务文件路径',
    'settings.singleFilePath.desc': '如果设为空，将默认为Daily Task.md在根目录下',
    'settings.template.variables': '可用变量',
    'settings.template.tags': '可用标签 (#every)',
    'settings.template.tags.desc': '支持：#every-day (每天), #every-workday (工作日), #every(mon, sun) (特定周几), #every(jan(1,15)) (特定日期)',
    'settings.template.vars.desc': '{{date}} - 日期, {{dateWithIcon}} - 图标日期, {{weekday}} - 星期, {{time}} - 时间',
    'commands.addDailyTask': '➕ 手动添加今日任务',
    'notification.taskAdded': '今日任务已添加',
    'notification.taskExists': '今日任务已存在',
    'notification.error': '错误：',
    'notification.generating': '正在生成今日任务...',
    'weekday.mon': '星期一',
    'weekday.tue': '星期二',
    'weekday.wed': '星期三',
    'weekday.thu': '星期四',
    'weekday.fri': '星期五',
    'weekday.sat': '星期六',
    'weekday.sun': '星期日',
    'plugin.name': 'Taskorator',
    'plugin.description': '一个强大的任务自动生成器，帮助你高效地管理日常任务',
    'button.addTask': '添加任务',
    'button.save': '保存',
    'button.cancel': '取消',
    'button.done': '完成',
};

// English translation
const translationsEN: Record<TranslationKey, string> = {
    'settings.title': 'Taskorator Settings',
    'settings.rootDir': '📁 Task directory',
    'settings.rootDir.desc': 'Specify the root directory for storing task files, tasks will be stored in "Year/Month.md" format',
    'settings.rootDir.saved': '✓ Directory saved',
    'settings.save': '💾 Save',
    'settings.autoGenerate': '🔄 Auto generate mode',
    'settings.autoGenerate.desc': 'Choose when to automatically generate daily tasks',
    'settings.mode.none': '❌ Off',
    'settings.mode.daily': '📆 Daily',
    'settings.mode.workday': '💼 Workdays only',
    'settings.language': '🔤 Interface language',
    'settings.language.desc': 'Select the language for the plugin interface',
    'settings.language.auto': '🔍 Auto detect',
    'settings.language.zh': 'Chinese',
    'settings.language.en': 'English',
    'settings.language.ar': 'Arabic',
    'settings.animations': '✨ Animation effects',
    'settings.animations.desc': 'Enable interface animation effects',
    'settings.template': '📝 Template',
    'settings.template.zh': 'Chinese template',
    'settings.template.en': 'English template',
    'settings.template.ar': 'Arabic template',
    'settings.template.preview': '👁️ Show preview',
    'settings.template.hide': '👁️‍🗨️ Hide preview',
    'settings.resetToDefault': 'Reset to default',
    'settings.addTaskButton': '➕ Add today\'s task manually',
    'settings.preview': 'Preview template',
    'settings.resetDefault': 'Reset to default',
    'template.dateWithIcon': 'Current date with icon',
    'settings.basicSettings': 'Basic',
    'settings.templateSettings': 'Templates',
    'settings.outputMode': '📤 Output Mode',
    'settings.outputMode.desc': 'Choose to archive monthly, overwrite a single file, or both',
    'settings.outputMode.traditional': '📂 Monthly Archive',
    'settings.outputMode.singleFile': '📄 Overwrite Single File',
    'settings.outputMode.both': '🔄 Both Together',
    'settings.outputLanguage': '📄 Output Format (Language)',
    'settings.outputLanguage.desc': 'Select the language for dates and weekdays in the generated task notes',
    'settings.singleFilePath': '📝 Single Task File Path',
    'settings.singleFilePath.desc': 'If left empty, defaults to Daily Task.md in root directory',
    'settings.template.variables': 'Available Variables',
    'settings.template.tags': 'Available Tags (#every)',
    'settings.template.tags.desc': 'Support: #every-day (Every day), #every-workday (Workdays), #every(mon, sun) (Specific days), #every(jan(1,15)) (Month/Date)',
    'settings.template.vars.desc': '{{date}} - Date, {{dateWithIcon}} - Icon Date, {{weekday}} - Weekday, {{time}} - Time',
    'commands.addDailyTask': '➕ Add today\'s task manually',
    'notification.taskAdded': 'Today\'s task has been added',
    'notification.taskExists': 'Today\'s task already exists',
    'notification.error': 'Error: ',
    'notification.generating': 'Generating today\'s tasks...',
    'weekday.mon': 'Monday',
    'weekday.tue': 'Tuesday',
    'weekday.wed': 'Wednesday',
    'weekday.thu': 'Thursday',
    'weekday.fri': 'Friday',
    'weekday.sat': 'Saturday',
    'weekday.sun': 'Sunday',
    'plugin.name': 'Taskorator',
    'plugin.description': 'A powerful task auto generator to help you efficiently manage daily tasks',
    'button.addTask': 'Add Task',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.done': 'Done',
};

// Arabic translation
const translationsAR: Record<TranslationKey, string> = {
    'settings.title': 'إعدادات Taskorator',
    'settings.rootDir': '📁 دليل المهام',
    'settings.rootDir.desc': 'حدد الدليل الرئيسي لتخزين ملفات المهام، سيتم تخزين المهام بصيغة "السنة/الشهر.md"',
    'settings.rootDir.saved': '✓ تم حفظ الدليل',
    'settings.save': '💾 حفظ',
    'settings.autoGenerate': '🔄 وضع التوليد التلقائي',
    'settings.autoGenerate.desc': 'اختر متى يتم توليد المهام اليومية تلقائياً',
    'settings.mode.none': '❌ إيقاف',
    'settings.mode.daily': '📆 يومياً',
    'settings.mode.workday': '💼 أيام العمل فقط',
    'settings.language': '🔤 لغة الواجهة',
    'settings.language.desc': 'اختر لغة واجهة الإضافة',
    'settings.language.auto': '🔍 كشف تلقائي',
    'settings.language.zh': 'الصينية',
    'settings.language.en': 'الإنجليزية',
    'settings.language.ar': 'العربية',
    'settings.animations': '✨ تأثيرات الحركة',
    'settings.animations.desc': 'تفعيل تأثيرات الحركة للواجهة',
    'settings.template': '📝 القالب',
    'settings.template.zh': 'قالب صيني',
    'settings.template.en': 'قالب إنجليزي',
    'settings.template.ar': 'قالب عربي',
    'settings.template.preview': '👁️ عرض المعاينة',
    'settings.template.hide': '👁️‍🗨️ إخفاء المعاينة',
    'settings.resetToDefault': 'استعادة الإعدادات الافتراضية',
    'settings.addTaskButton': '➕ إضافة مهمة اليوم يدوياً',
    'settings.preview': 'معاينة القالب',
    'settings.resetDefault': 'استعادة الافتراضي',
    'template.dateWithIcon': 'التاريخ الحالي مع أيقونة',
    'settings.basicSettings': '⚙️ الإعدادات الأساسية',
    'settings.templateSettings': '📝 إعدادات القالب',
    'settings.outputMode': '📤 وضع الإخراج',
    'settings.outputMode.desc': 'اختر الأرشفة الشهرية، أو الكتابة فوق ملف واحد، أو كليهما معاً',
    'settings.outputMode.traditional': '📂 أرشفة شهرية',
    'settings.outputMode.singleFile': '📄 ملف واحد متجدد',
    'settings.outputMode.both': '🔄 كلاهما معاً',
    'settings.outputLanguage': '📄 تنسيق الإخراج (اللغة)',
    'settings.outputLanguage.desc': 'اختر لغة التاريخ واليوم في ملاحظات المهام المولدة',
    'settings.singleFilePath': '📄 مسار ملف المهام الموحد',
    'settings.singleFilePath.desc': 'إذا ترك فارغاً، سيتم تعيين Daily Task.md في المجلد الرئيسي كافتراضي',
    'settings.template.variables': '📋 المتغيرات المتاحة',
    'settings.template.tags': '🏷️ الوسوم المتاحة (#every)',
    'settings.template.tags.desc': 'دعم: #every-day (يومياً), #every-workday (أيام العمل), #every(mon, sun) (أيام محددة), #every(jan(1,15)) (أيام محددة في الشهر)',
    'settings.template.vars.desc': '{{date}} - التاريخ, {{dateWithIcon}} - أيقونة التاريخ, {{weekday}} - اليوم, {{time}} - الوقت',
    'commands.addDailyTask': '➕ إضافة مهمة اليوم يدوياً',
    'notification.taskAdded': 'تم إضافة مهمة اليوم',
    'notification.taskExists': 'مهمة اليوم موجودة بالفعل',
    'notification.error': 'خطأ: ',
    'notification.generating': 'جاري توليد مهام اليوم...',
    'weekday.mon': 'الإثنين',
    'weekday.tue': 'الثلاثاء',
    'weekday.wed': 'الأربعاء',
    'weekday.thu': 'الخميس',
    'weekday.fri': 'الجمعة',
    'weekday.sat': 'السبت',
    'weekday.sun': 'الأحد',
    'plugin.name': 'Taskorator',
    'plugin.description': 'مولد مهام قوي يساعدك على إدارة مهامك اليومية بكفاءة',
    'button.addTask': 'إضافة مهمة',
    'button.save': 'حفظ',
    'button.cancel': 'إلغاء',
    'button.done': 'تم',
};

// Translation lookup table
const translations: Record<string, Record<TranslationKey, string>> = {
    'zh': translationsZH,
    'en': translationsEN,
    'ar': translationsAR
};

// Current language
let currentLanguage = 'en';

/**
 * Set current language
 * @param language Language code
 */
export function getCurrentLanguage(): string {
    return currentLanguage;
}

export function setCurrentLanguage(language: string): void {
    currentLanguage = language;
}

/**
 * Get translation text
 * @param key Translation key
 * @param fallbackLanguage Fallback language
 * @returns Translated text
 */
export function getTranslation(key: TranslationKey, fallbackLanguage?: string): string {
    const language = fallbackLanguage || currentLanguage;
    
    // Get translation for corresponding language
    const translation = translations[language]?.[key];
    
    // If no translation found, try English, then fallback to key
    if (!translation) {
        return translations['en']?.[key] || key;
    }
    
    return translation;
}

/**
 * Get localized weekday name
 * @param dayOfWeek Day of week as number (0-6, 0 for Sunday)
 * @param language Optional specific language
 * @returns Localized weekday name
 */
export function getLocalizedWeekday(dayOfWeek: number, language?: string): string {
    const weekdayKeys: TranslationKey[] = [
        'weekday.sun', 'weekday.mon', 'weekday.tue',
        'weekday.wed', 'weekday.thu', 'weekday.fri', 'weekday.sat'
    ];
    
    // Ensure dayOfWeek is in valid range
    const normalizedDayOfWeek = ((dayOfWeek % 7) + 7) % 7;
    return getTranslation(weekdayKeys[normalizedDayOfWeek], language);
}
