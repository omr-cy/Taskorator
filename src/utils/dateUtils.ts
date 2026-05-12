import {
  getLocalizedWeekday,
  getTranslation,
  getCurrentLanguage,
} from "../i18n/i18n";

/**
 * Date processing utility functions
 */

/**
 * Get current year
 * @returns Current year, e.g., 2025
 */
export function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}

/**
 * Get current month number
 * @returns Current month, e.g., 04
 */
export function getCurrentMonth(): string {
  const month = (new Date().getMonth() + 1).toString();
  return month.padStart(2, "0");
}

/**
 * Get localized month name
 * @param language Language code
 * @param customMonthIndex Custom month index
 * @returns Month name, e.g., "April" in English
 */
export function getLocalizedMonthName(
  language?: string,
  customMonthIndex?: number,
): string {
  const monthIndex =
    customMonthIndex !== undefined ? customMonthIndex : new Date().getMonth(); // 0-11
  const currentLang = language || getCurrentLanguage();

  // Chinese month names
  const chineseMonths = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  // English month names
  const englishMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Arabic months
  const arabicMonths = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const formattedMonthNum = (monthIndex + 1).toString().padStart(2, "0");

  if (currentLang === "zh") {
    return `${formattedMonthNum} - ${chineseMonths[monthIndex]}`;
  } else if (currentLang === "ar") {
    return `${formattedMonthNum} - ${arabicMonths[monthIndex]}`;
  } else {
    return `${formattedMonthNum} - ${englishMonths[monthIndex]}`;
  }
}

/**
 * Get icon corresponding to current day
 * @returns Icon for the date
 */
export function getDayIcon(): string {
  const day = new Date().getDate(); // 1-31

  // Assign a unique icon for each day
  const dayIcons = [
    "🌑", // Day 1
    "🌒", // Day 2
    "🌓", // Day 3
    "🌔", // Day 4
    "🌕", // Day 5
    "🌖", // Day 6
    "🌗", // Day 7
    "🌘", // Day 8
    "🌟", // Day 9
    "⭐", // Day 10
    "🌈", // Day 11
    "🌞", // Day 12
    "🌤️", // Day 13
    "⛅", // Day 14
    "🌦️", // Day 15
    "🌧️", // Day 16
    "⛈️", // Day 17
    "🌩️", // Day 18
    "🌪️", // Day 19
    "🌫️", // Day 20
    "🌬️", // Day 21
    "🍀", // Day 22
    "🌱", // Day 23
    "🌲", // Day 24
    "🌳", // Day 25
    "🌴", // Day 26
    "🌵", // Day 27
    "🌺", // Day 28
    "🌻", // Day 29
    "🌼", // Day 30
    "🌸", // Day 31
  ];

  // Adjust index because it starts from 0 while days start from 1
  return dayIcons[day - 1] || "📅"; // Fallback to default calendar icon
}

/**
 * Determine if the current environment is English
 * @returns Whether it's English environment
 */
export function isEnglishEnvironment(): boolean {
  // Test current language by translating "Monday"
  // if it's "Monday", it's English environment
  const mondayText = getTranslation("weekday.mon");
  return mondayText === "Monday";
}

/**
 * Get current day
 * @returns Current day, e.g., 16
 */
export function getCurrentDay(): string {
  const day = new Date().getDate().toString();
  return day.padStart(2, "0");
}

/**
 * Get current full date
 * @returns Full date, e.g., 2025-04-16
 */
export function getCurrentDate(): string {
  return `${getCurrentYear()}-${getCurrentMonth()}-${getCurrentDay()}`;
}

/**
 * Get current full date with icon
 * @param language Optional language code
 * @returns Full date with icon, e.g., 🌕 2025-04-16
 */
export function getCurrentDateWithIcon(language?: string): string {
  const icon = getDayIcon();
  return `${icon} ${getCurrentDate()}`;
}

/**
 * Determine if the current day is a workday (Mon-Fri)
 * @returns Whether it's a workday
 */
export function isWorkday(): boolean {
  const day = new Date().getDay();
  // 0 is Sunday, 1-5 is Mon-Fri, 6 is Saturday
  return day >= 1 && day <= 5;
}

/**
 * Get current localized weekday name
 * @param language Optional language code
 * @returns Localized weekday name
 */
export function getCurrentWeekdayName(language?: string): string {
  const day = new Date().getDay();
  return getLocalizedWeekday(day, language);
}
