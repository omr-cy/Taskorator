import { normalizePath, TFile, Vault } from "obsidian";
import { getLocalizedMonthName } from "./dateUtils";

/**
 * 文件操作工具函数
 */

/**
 * 确保目录存在，如果不存在则创建
 * @param vault Obsidian文件系统
 * @param path 目录路径
 * @returns 是否成功创建或已存在
 */
export async function ensureFolderExists(vault: Vault, path: string): Promise<boolean> {
    try {
        const folderParts = path.split('/').filter(part => part.trim() !== '');
        let currentPath = '';
        
        for (const part of folderParts) {
            if (currentPath) {
                currentPath += '/' + part;
            } else {
                currentPath = part;
            }
            
            const normalizedPath = normalizePath(currentPath);
            const folder = vault.getAbstractFileByPath(normalizedPath);
            
            if (!folder) {
                await vault.createFolder(normalizedPath);
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 确保文件存在，如果不存在则创建
 * @param vault Obsidian文件系统
 * @param path 文件路径
 * @param content 文件内容
 * @returns 是否成功创建或已存在
 */
export async function ensureFileExists(vault: Vault, path: string, content: string = ''): Promise<boolean> {
    try {
        // 确保文件夹结构存在
        const normalizedPath = normalizePath(path);
        const folderPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
        
        if (folderPath) {
            const folderExists = await ensureFolderExists(vault, folderPath);
            if (!folderExists) {
                return false;
            }
        }
        
        // 检查文件是否存在
        const file = vault.getAbstractFileByPath(normalizedPath);
        
        if (!file) {
            // 创建文件并写入内容
            await vault.create(normalizedPath, content);
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 向文件追加内容
 * @param vault Obsidian文件系统
 * @param path 文件路径
 * @param content 要追加的内容
 * @returns 是否成功追加
 */
export async function appendToFile(vault: Vault, path: string, content: string): Promise<boolean> {
    try {
        const normalizedPath = normalizePath(path);
        
        // 确保文件存在
        const fileExists = await ensureFileExists(vault, normalizedPath);
        if (!fileExists) {
            return false;
        }

        // 获取文件对象
        const file = vault.getAbstractFileByPath(normalizedPath);
        if (!(file instanceof TFile)) {
            return false;
        }
        
        // 读取文件当前内容
        const currentContent = await vault.read(file);
        
        // 追加新内容
        const lastChar = currentContent.slice(-1);
        const separator = (lastChar === '\n' || currentContent === '') ? '' : '\n';
        const newContent = currentContent + separator + content;
        
        // 将合并后的内容写回文件
        await vault.modify(file, newContent);
        
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 检查文件中是否包含指定内容
 * @param vault Obsidian文件系统
 * @param path 文件路径
 * @param content 要检查的内容
 * @returns 是否包含指定内容
 */
export async function fileContains(vault: Vault, path: string, content: string): Promise<boolean> {
    try {
        const normalizedPath = normalizePath(path);
        
        // 获取文件对象
        const file = vault.getAbstractFileByPath(normalizedPath);
        if (!(file instanceof TFile)) {
            return false;
        }

        // 读取文件内容
        const fileContent = await vault.read(file);
        
        // 检查是否包含指定内容
        return fileContent.includes(content);
    } catch (error) {
        return false;
    }
}

/**
 * 根据当前日期生成任务文件路径
 * @param rootDir 根目录
 * @returns 任务文件路径，格式为：rootDir/year/monthName.md
 */
export function getTaskFilePath(rootDir: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const yearDir = year.toString();
    
    // 使用本地化的月份名称
    const monthName = getLocalizedMonthName();
    
    const monthFile = `${monthName}.md`;
    
    return normalizePath(`${rootDir}/${yearDir}/${monthFile}`);
}

/**
 * 检查今日任务是否已存在
 * @param vault Obsidian文件系统
 * @param rootDir 根目录
 * @returns 是否已存在
 */
export async function todayTaskExists(vault: Vault, rootDir: string): Promise<boolean> {
    const taskFilePath = getTaskFilePath(rootDir);
    return vault.getAbstractFileByPath(taskFilePath) !== null;
}
