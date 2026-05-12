import { normalizePath, TFile, Vault } from "obsidian";
import { getLocalizedMonthName } from "./dateUtils";

/**
 * File operation utility functions
 */

/**
 * Ensure folder exists, create if it doesn't
 * @param vault Obsidian vault
 * @param path Folder path
 * @returns Whether created successfully or already exists
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
 * Ensure file exists, create if it doesn't
 * @param vault Obsidian vault
 * @param path File path
 * @param content File content
 * @returns Whether created successfully or already exists
 */
export async function ensureFileExists(vault: Vault, path: string, content: string = ''): Promise<boolean> {
    try {
        // Ensure folder structure exists
        const normalizedPath = normalizePath(path);
        const folderPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
        
        if (folderPath) {
            const folderExists = await ensureFolderExists(vault, folderPath);
            if (!folderExists) {
                return false;
            }
        }
        
        // Check if file exists
        const file = vault.getAbstractFileByPath(normalizedPath);
        
        if (!file) {
            // Create file and write content
            await vault.create(normalizedPath, content);
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Append content to file
 * @param vault Obsidian vault
 * @param path File path
 * @param content Content to append
 * @returns Whether appended successfully
 */
export async function appendToFile(vault: Vault, path: string, content: string): Promise<boolean> {
    try {
        const normalizedPath = normalizePath(path);
        
        // Ensure file exists
        const fileExists = await ensureFileExists(vault, normalizedPath);
        if (!fileExists) {
            return false;
        }

        // Get file object
        const file = vault.getAbstractFileByPath(normalizedPath);
        if (!(file instanceof TFile)) {
            return false;
        }
        
        // Read current content of file
        const currentContent = await vault.read(file);
        
        // Append new content
        const lastChar = currentContent.slice(-1);
        const separator = (lastChar === '\n' || currentContent === '') ? '' : '\n';
        const newContent = currentContent + separator + content;
        
        // Write merged content back to file
        await vault.modify(file, newContent);
        
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Check if file contains specified content
 * @param vault Obsidian vault
 * @param path File path
 * @param content Content to check
 * @returns Whether it contains the content
 */
export async function fileContains(vault: Vault, path: string, content: string): Promise<boolean> {
    try {
        const normalizedPath = normalizePath(path);
        
        // Get file object
        const file = vault.getAbstractFileByPath(normalizedPath);
        if (!(file instanceof TFile)) {
            return false;
        }

        // Read file content
        const fileContent = await vault.read(file);
        
        // Check if it contains specified content
        return fileContent.includes(content);
    } catch (error) {
        return false;
    }
}

/**
 * Generate task file path based on current date
 * @param rootDir Root directory
 * @returns Task file path, format: rootDir/year/monthName.md
 */
export function getTaskFilePath(rootDir: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const yearDir = year.toString();
    
    // Use localized month name
    const monthName = getLocalizedMonthName();
    
    const monthFile = `${monthName}.md`;
    
    return normalizePath(`${rootDir}/${yearDir}/${monthFile}`);
}

/**
 * Check if today's task already exists
 * @param vault Obsidian vault
 * @param rootDir Root directory
 * @returns Whether it exists
 */
export async function todayTaskExists(vault: Vault, rootDir: string): Promise<boolean> {
    const taskFilePath = getTaskFilePath(rootDir);
    return vault.getAbstractFileByPath(taskFilePath) !== null;
}
