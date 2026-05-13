import { 
    getCurrentDate, 
    getCurrentWeekdayName, 
    getCurrentDateWithIcon 
} from "./dateUtils";

/**
 * Template variable rendering engine
 */

/**
 * Get current time
 * @returns Current time, e.g., 10:30
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
        if (segment === 'workday' || segment === 'workdays' || segment === 'weekday' || segment === 'weekdays' || segment === 'every-workday') {
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
 * @param template Template content
 * @param isPreview Whether to style skipped lines for preview
 */
export function filterTemplateByDay(template: string, isPreview: boolean = false): string {
    const lines = template.split(/\r?\n/);
    const result: string[] = [];
    
    let skipHeaderLevel: number | null = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle comments (starting with //) - we skip them in the rendered output
        if (line.trim().startsWith('//')) {
            continue;
        }
        
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
            
            // Check for #every tag - handles #every mon, #every(mon), #every (mon), #every-day, #every-workday
            const everyDayMatch = line.match(/#every-day/i);
            const everyWorkdayMatch = line.match(/#every-workday/i);
            
            if (everyDayMatch) {
                result.push(line.replace(/\s*#every-day/i, ''));
                continue;
            }
            
            if (everyWorkdayMatch) {
                const now = new Date();
                const today = now.getDay();
                if (today >= 1 && today <= 5) {
                    result.push(line.replace(/\s*#every-workday/i, ''));
                } else {
                    skipHeaderLevel = level;
                }
                continue;
            }

            const tagMatch = line.match(/#every\s*(?:\(([\w\s,()-]+)\)|([\w\s,()-]+))/i);
            if (tagMatch) {
                const args = tagMatch[1] || tagMatch[2];
                // Explicitly check for 'workday' in generic tagMatch to avoid confusion, but we prefer every-workday
                if (args.toLowerCase().includes('workday') && !args.toLowerCase().includes('every-workday')) {
                    // if they still use #every(workday), we skip it to force #every-workday as requested
                    skipHeaderLevel = level;
                    continue;
                }
                
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
        const everyDayMatchLine = line.match(/#every-day/i);
        const everyWorkdayMatchLine = line.match(/#every-workday/i);
        
        if (everyDayMatchLine) {
            result.push(line.replace(/\s*#every-day/i, ''));
            continue;
        }
        
        if (everyWorkdayMatchLine) {
            const now = new Date();
            const today = now.getDay();
            if (today >= 1 && today <= 5) {
                result.push(line.replace(/\s*#every-workday/i, ''));
            }
            continue;
        }

        const tagMatch = line.match(/#every\s*(?:\(([\w\s,()-]+)\)|([\w\s,()-]+))/i);
        if (tagMatch) {
            const args = tagMatch[1] || tagMatch[2];
            // Force #every-workday by ignoring 'workday' in general #every tag
            if (args.toLowerCase().includes('workday') && !args.toLowerCase().includes('every-workday')) {
                continue;
            }
            
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
 * Render template content, replacing its variables
 * @param template Template content
 * @param outputLanguage Optional language for localized variables
 * @param isPreview Optional flag to style comments instead of skipping them
 * @returns Rendered content
 */
export function renderTemplate(template: string, outputLanguage?: string, isPreview: boolean = false): string {
    // 1. Filter out days based on #every tag
    let filteredTemplate = filterTemplateByDay(template, isPreview);

    // 2. Define variable mapping
    const variableMap: Record<string, string | number> = {
        'date': getCurrentDate(),
        'dateWithIcon': getCurrentDateWithIcon(outputLanguage),
        'weekday': getCurrentWeekdayName(outputLanguage),
        'time': getCurrentTime()
    };
    
    // Replace variables in the template
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
 * Get variable descriptions
 * @returns Variable descriptions
 */
export function getTemplateVariables(): Record<string, string> {
    return {
        'date': 'Current date (YYYY-MM-DD)',
        'dateWithIcon': 'Current date with daily icon',
        'weekday': 'Current weekday',
        'time': 'Current time (HH:MM)'
    };
}
 