/**
 * Auto generation mode enumeration
 */
export enum AutoGenerateMode {
    NONE = 'none',     // Disable auto generation
    DAILY = 'daily',   // Daily auto generation
    WORKDAY = 'workday' // Only workday auto generation
}

/**
 * Storage mode enumeration
 */
export enum StorageMode {
    TRADITIONAL = 'traditional', // Traditional mode (archive by year/month folders)
    SINGLE_FILE = 'single_file', // Single file mode (overwrite the same file daily)
    BOTH = 'both'                // Use both modes
}

/**
 * Settings UI Language
 */
export enum Language {
    AUTO = 'auto',
    ZH = 'zh',
    EN = 'en',
    AR = 'ar'
}

/**
 * Plugin settings interface
 */
export interface TaskoratorSettings {
    // Basic configuration
    storageMode: StorageMode;      // Storage mode
    singleFilePath: string;        // File path for single file mode
    rootDir: string;               // Root directory for task files (traditional mode)
    autoGenerateMode: AutoGenerateMode; // Auto-generation mode
    language: string;            // UI language

    // Template configuration
    templateZh: string;            // Chinese task template
    templateEn: string;            // English task template
    templateAr: string;            // Arabic task template

    // New: User-defined custom template
    customTemplate: string;

    // New: Flag for using custom template
    hasCustomTemplate: boolean;
}

/**
 * Default Chinese template
 */
export const DEFAULT_TEMPLATE_ZH = `## {{dateWithIcon}}（{{weekday}}）

> 📊 年进度：{{yearProgress}} | 🌙 月进度：{{monthProgress}}

### 🧘 今日计划
---

- [ ] 🧘 冥想 10 分钟 #every-day
- [ ] 📝 复盘前一日计划 #every-day
- [ ] 📚 阅读 20 页书 #every mon, wed, fri

### 📝 工作任务
---

- [ ] 整理今日工作计划 #every workday
- [ ] 重要会议 #every mon
- [ ] 周末总结 #every sun
`;

/**
 * Default English template
 */
export const DEFAULT_TEMPLATE_EN = `## {{dateWithIcon}} ({{weekday}})

### Today's Plan 

- [ ] 📝 Review yesterday's plan #every-day
- [ ] 📚 Read 20 pages #every(mon, wed, fri)
- [ ] ⚽ Playing Football #every(month(1,11,21))


### 📝 Work Tasks

- [ ] Organize today's work schedule #every(workday)
- [ ] Important Meeting #every(jun(15), feb(15))
- [ ] Weekend Summary #every(sun)


### Learning Programming #every-day

- [ ] C++
- [ ] Python
`;

/**
 * Default Arabic template
 */
export const DEFAULT_TEMPLATE_AR = `## {{dateWithIcon}} ({{weekday}})

### خطة اليوم 

- [ ] 📝 مراجعة خطة الأمس #every-day
- [ ] 📚 قراءة 20 صفحة #every(mon, wed, fri)
- [ ] ⚽ ممارسة كرة القدم #every(month(1,11,21))


### 📝 مهام العمل

- [ ] تنظيم جدول عمل اليوم #every(workday)
- [ ] اجتماع هام #every(jun(15), feb(15))
- [ ] ملخص الأسبوع #every(sun)


### تعلم البرمجة #every-day

- [ ] C++
- [ ] Python
`;

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: TaskoratorSettings = {
    storageMode: StorageMode.TRADITIONAL,
    singleFilePath: 'Tasks.md',
    rootDir: 'Tasks',
    autoGenerateMode: AutoGenerateMode.DAILY,
    language: Language.AUTO,
    templateZh: DEFAULT_TEMPLATE_ZH,
    templateEn: DEFAULT_TEMPLATE_EN,
    templateAr: DEFAULT_TEMPLATE_AR,
    customTemplate: '', // Default is empty, meaning use the language-specific default template
    hasCustomTemplate: false // Default is not use custom template
};
