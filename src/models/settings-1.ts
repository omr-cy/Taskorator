/**
 * 自动生成模式枚举
 */
export enum AutoGenerateMode {
    NONE = 'none',     // 关闭自动生成
    DAILY = 'daily',   // 每日自动生成
    WORKDAY = 'workday' // 仅工作日自动生成
}

/**
 * 存储模式枚举
 */
export enum StorageMode {
    TRADITIONAL = 'traditional', // 传统模式（按年月文件夹归档）
    SINGLE_FILE = 'single_file', // 单文件模式（每天覆盖同一个文件）
    BOTH = 'both'                // 同时使用两种模式
}

/**
 * 设置界面语言
 */
export enum Language {
    AUTO = 'auto',
    ZH = 'zh',
    EN = 'en',
    AR = 'ar'
}

/**
 * 插件设置接口
 */
export interface TaskoratorSettings {
    // 基础配置
    storageMode: StorageMode;      // 存储模式
    singleFilePath: string;        // 单文件模式下的文件路径
    rootDir: string;               // 任务文件存放的根目录 (传统模式)
    autoGenerateMode: AutoGenerateMode; // 自动生成模式
    language: string;            // 界面语言

    // 模板配置
    templateZh: string;            // 中文任务模板
    templateEn: string;            // 英文任务模板
    templateAr: string;            // 阿拉伯语任务模板

    // 新增：用户自定义模板
    customTemplate: string;

    // 新增：标记是否使用自定义模板
    hasCustomTemplate: boolean;
}

/**
 * 默认中文模板
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
 * 默认英文模板
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
 * 默认阿拉伯语模板
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
 * 默认设置
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
    customTemplate: '', // 默认为空，表示使用语言相关的默认模板
    hasCustomTemplate: false // 默认不使用自定义模板
}; 
