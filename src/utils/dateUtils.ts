import { getLocalizedWeekday, getTranslation, getCurrentLanguage } from "../i18n/i18n";

/**
 * 日期处理工具函数
 */

/**
 * 获取当前年份
 * @returns 当前年份，如2025
 */
export function getCurrentYear(): string {
    return new Date().getFullYear().toString();
}

/**
 * 获取当前月份数字
 * @returns 当前月份，如04
 */
export function getCurrentMonth(): string {
    const month = (new Date().getMonth() + 1).toString();
    return month.padStart(2, '0');
}

/**
 * 获取当前月份的本地化名称
 * @param isEnglish 是否使用英文
 * @returns 月份名称，如中文环境下的"4月"，英文环境下的"April"
 */
export function getLocalizedMonthName(language?: string, customMonthIndex?: number): string {
    const monthIndex = customMonthIndex !== undefined ? customMonthIndex : new Date().getMonth(); // 0-11
    const currentLang = language || getCurrentLanguage();
    
    // 中文月份名称
    const chineseMonths = [
        "1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月"
    ];
    
    // 英文月份名称
    const englishMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Arabic months
    const arabicMonths = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    
    const formattedMonthNum = (monthIndex + 1).toString().padStart(2, '0');

    if (currentLang === 'zh') {
        return `${formattedMonthNum} - ${chineseMonths[monthIndex]}`;
    } else if (currentLang === 'ar') {
        return `${formattedMonthNum} - ${arabicMonths[monthIndex]}`;
    } else {
        return `${formattedMonthNum} - ${englishMonths[monthIndex]}`;
    }
}

/**
 * 获取当天对应的图标
 * @returns 对应日期的图标
 */
export function getDayIcon(): string {
    const day = new Date().getDate(); // 1-31
    
    // 为每天分配一个独特的图标
    const dayIcons = [
        "🌑", // 1日
        "🌒", // 2日
        "🌓", // 3日
        "🌔", // 4日
        "🌕", // 5日
        "🌖", // 6日
        "🌗", // 7日
        "🌘", // 8日
        "🌟", // 9日
        "⭐", // 10日
        "🌈", // 11日
        "🌞", // 12日
        "🌤️", // 13日
        "⛅", // 14日
        "🌦️", // 15日
        "🌧️", // 16日
        "⛈️", // 17日
        "🌩️", // 18日
        "🌪️", // 19日
        "🌫️", // 20日
        "🌬️", // 21日
        "🍀", // 22日
        "🌱", // 23日
        "🌲", // 24日
        "🌳", // 25日
        "🌴", // 26日
        "🌵", // 27日
        "🌺", // 28日
        "🌻", // 29日
        "🌼", // 30日
        "🌸", // 31日
    ];
    
    // 索引从0开始，天数从1开始，所以减1
    return dayIcons[day - 1] || "📅"; // 如果出现意外，返回默认日历图标
}

/**
 * 判断当前是否为英文环境
 * @returns 是否为英文环境
 */
export function isEnglishEnvironment(): boolean {
    // 通过翻译系统中的周一测试当前语言
    // 获取"weekday.mon"的翻译，如果是"Monday"则为英文环境
    const mondayText = getTranslation("weekday.mon");
    return mondayText === "Monday";
}

/**
 * 获取当前日期
 * @returns 当前日期，如16
 */
export function getCurrentDay(): string {
    const day = new Date().getDate().toString();
    return day.padStart(2, '0');
}

/**
 * 获取当前完整日期
 * @returns 完整日期，如2025-04-16
 */
export function getCurrentDate(): string {
    return `${getCurrentYear()}-${getCurrentMonth()}-${getCurrentDay()}`;
}

/**
 * 获取当前带图标的完整日期
 * @returns 带图标的完整日期，如🌕 2025-04-16
 */
export function getCurrentDateWithIcon(): string {
    const icon = getDayIcon();
    return `${icon} ${getCurrentDate()}`;
}

/**
 * 判断当前是否为工作日（周一至周五）
 * @returns 是否为工作日
 */
export function isWorkday(): boolean {
    const day = new Date().getDay();
    // 0是周日，1-5是周一至周五，6是周六
    return day >= 1 && day <= 5;
}

/**
 * 获取当前星期几的本地化名称
 * @returns 本地化的星期名称
 */
export function getCurrentWeekdayName(): string {
    const day = new Date().getDay();
    return getLocalizedWeekday(day);
}

/**
 * 计算当年进度百分比
 * @returns 当年进度百分比
 */
export function getYearProgress(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1); // 当年1月1日
    const end = new Date(now.getFullYear() + 1, 0, 1); // 下一年1月1日
    
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const passedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.round((passedDays / totalDays) * 100);
}

/**
 * 计算当月进度百分比
 * @returns 当月进度百分比
 */
export function getMonthProgress(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // 当月1日
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 下个月1日
    
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const passedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.round((passedDays / totalDays) * 100);
} 