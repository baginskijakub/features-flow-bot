import { TFile } from './types'
import fs from 'fs/promises'
import path from 'path'
import * as core from '@actions/core'

export async function findFilesWithFlags(directory: string, flags: string[]): Promise<TFile[]> {
  const filesToModify: TFile[] = [];

  const normalizedDir = path.resolve(process.cwd(), directory);

  try {
    const dirStats = await fs.stat(normalizedDir);
    if (!dirStats.isDirectory()) {
      throw new Error(`Path ${normalizedDir} is not a directory`);
    }
  } catch (error) {
    core.error(`Error accessing directory ${normalizedDir}: ${error}`);
    throw error;
  }

  async function searchDirectory(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await searchDirectory(fullPath);
        } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            if (flags.some(flag => content.includes(flag))) {
              filesToModify.push({ path: fullPath, content });
              core.debug(`Found flag in file: ${fullPath}`);
            }
          } catch (error) {
            core.warning(`Error reading file ${fullPath}: ${error}`);
          }
        }
      }
    } catch (error) {
      core.error(`Error processing directory ${dir}: ${error}`);
      throw error;
    }
  }

  await searchDirectory(normalizedDir);
  core.info(`Found ${filesToModify.length} files containing flags`);
  return filesToModify;
}