import { 
    getCurrentDate, 
    getCurrentWeekdayName, 
    getYearProgress, 
    getMonthProgress, 
    getCurrentDateWithIcon 
} from "./dateUtils";

/**
 * 模板变量渲染引擎
 */

/**
 * 获取当前时间
 * @returns 当前时间，如10:30
 */
function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function isTodayIncluded(daysListStr: string): boolean {
    const now = new Date();
    const today = now.getDay(); // 0 is Sunday
    const month = now.getMonth(); // 0 is January
    const date = now.getDate(); // 1-31
    
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const fullDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const fullMonthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    
    // Normalize string: lower case, remove outermost parens if any
    const normalized = daysListStr.toLowerCase().trim().replace(/^\(|\)$/g, '');
    
    // Handle segments (splitting by comma but respecting parentheses)
    const segments: string[] = [];
    let currentSegment = '';
    let parenDepth = 0;
    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
        if (char === ',' && parenDepth === 0) {
            segments.push(currentSegment.trim());
            currentSegment = '';
        } else {
            currentSegment += char;
        }
    }
    if (currentSegment) segments.push(currentSegment.trim());

    for (const segment of segments) {
        // Global shortcuts
        if (segment === 'all' || segment === 'everyday' || segment === 'every-day') return true;
        
        // Workday and Weekend shortcuts
        if (segment === 'workday' || segment === 'workdays' || segment === 'weekday' || segment === 'weekdays') {
            if (today >= 1 && today <= 5) return true;
            continue;
        }
        if (segment === 'weekend' || segment === 'weekends') {
            if (today === 0 || today === 6) return true;
            continue;
        }

        // Handle specific days in month: jan(1,2,6) or every month: month(1,2,6)
        const monthDayMatch = segment.match(/^(\w+)\s*\(([\d,\s]+)\)$/);
        if (monthDayMatch) {
            const mName = monthDayMatch[1];
            const mDays = monthDayMatch[2].split(',').map(d => parseInt(d.trim()));
            
            if (mName === 'month' || mName === monthNames[month] || mName === fullMonthNames[month]) {
                if (mDays.includes(date)) return true;
            }
            continue;
        }
        
        // Check weekdays
        if (dayNames.includes(segment) || fullDayNames.includes(segment)) {
            if (segment === dayNames[today] || segment === fullDayNames[today]) return true;
            continue;
        }
        
        // Check months
        if (monthNames.includes(segment) || fullMonthNames.includes(segment)) {
            if (segment === monthNames[month] || segment === fullMonthNames[month]) return true;
            continue;
        }
    }
    
    return false;
}

/**
 * Filter template depending on the #every(...) tags
 */
export function filterTemplateByDay(template: string): string {
    const lines = template.split(/\r?\n/);
    const result: string[] = [];
    
    let skipHeaderLevel: number | null = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match heading
        const headerMatch = line.match(/^(#{1,6})\s/);
        
        if (headerMatch) {
            const level = headerMatch[1].length;
            
            // Check if we stop skipping
            if (skipHeaderLevel !== null && level <= skipHeaderLevel) {
                skipHeaderLevel = null;
            }
            
            // If we are still skipping due to an ancestor heading, skip it
            if (skipHeaderLevel !== null) {
                continue;
            }
            
            // Check for #every tag - handles #every mon, #every(mon), #every (mon), #every-day
            const everyDayMatch = line.match(/#every-day/i);
            if (everyDayMatch) {
                result.push(line.replace(/\s*#every-day/i, ''));
                continue;
            }

            const tagMatch = line.match(/#every\s*(?:\(([\w\s,()-]+)\)|([\w\s,()-]+))/i);
            if (tagMatch) {
                const args = tagMatch[1] || tagMatch[2];
                if (!isTodayIncluded(args)) {
                    skipHeaderLevel = level;
                    continue; // Skip heading
                } else {
                    // Include heading, remove tag
                    result.push(line.replace(/\s*#every\s*(?:\([\w\s,()-]+\)|[\w\s,()-]+)/i, ''));
                    continue;
                }
            } else {
                result.push(line);
                continue;
            }
        }
        
        // Non-heading lines
        if (skipHeaderLevel !== null) {
            continue; // Skip because it's under a skipped heading
        }
        
        // Handle #every on regular lines
        const everyDayMatch = line.match(/#every-day/i);
        if (everyDayMatch) {
            result.push(line.replace(/\s*#every-day/i, ''));
            continue;
        }

        const tagMatch = line.match(/#every\s*(?:\(([\w\s,()-]+)\)|([\w\s,()-]+))/i);
        if (tagMatch) {
            const args = tagMatch[1] || tagMatch[2];
            if (!isTodayIncluded(args)) {
                continue; // Skip line
            } else {
                result.push(line.replace(/\s*#every\s*(?:\([\w\s,()-]+\)|[\w\s,()-]+)/i, ''));
                continue;
            }
        }
        
        result.push(line);
    }
    
    // Clean up excessive empty lines
    let cleaned = result.join('\n').replace(/\n{3,}/g, '\n\n');
    return cleaned;
}

/**
 * 渲染模板内容，替换其中的变量
 * @param template 模板内容
 * @returns 渲染后的内容
 */
export function renderTemplate(template: string): string {
    // 1. Filter out days based on #every tag
    let filteredTemplate = filterTemplateByDay(template);

    // 2. 定义变量映射
    const variableMap: Record<string, string | number> = {
        'date': getCurrentDate(),
        'dateWithIcon': getCurrentDateWithIcon(),
        'weekday': getCurrentWeekdayName(),
        'yearProgress': getYearProgress(),
        'monthProgress': getMonthProgress(),
        'time': getCurrentTime()
    };
    
    // 替换模板中的变量
    let renderedContent = filteredTemplate;
    for (const [variable, value] of Object.entries(variableMap)) {
        renderedContent = renderedContent.replace(
            new RegExp(`{{${variable}}}`, 'g'), 
            value.toString()
        );
    }
    
    return renderedContent;
}

/**
 * 获取变量说明
 * @returns 变量说明，包括中英文
 */
export function getTemplateVariables(): Record<string, string> {
    return {
        'date': '当前日期 / Current date (YYYY-MM-DD)',
        'dateWithIcon': '带图标的当前日期 / Current date with daily icon',
        'weekday': '当前星期 / Current weekday',
        'yearProgress': '年度进度百分比 / Year progress percentage',
        'monthProgress': '月度进度百分比 / Month progress percentage',
        'time': '当前时间 / Current time (HH:MM)'
    };
} 