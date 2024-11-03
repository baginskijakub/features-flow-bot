import { TFile, TResponse } from './types'
import fs from 'fs/promises'
import path from 'path'

export async function findFilesWithFlags(directory: string, flags: string[]): Promise<TFile[]> {
  const filesToModify: TFile[] = [];

  async function searchDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await searchDirectory(fullPath);
      } else if (entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name)) {
        const content = await fs.readFile(fullPath, 'utf8');
        if (flags.some(flag => content.includes(flag))) {
          filesToModify.push({ path: fullPath, content });
        }
      }
    }
  }

  await searchDirectory(directory);
  return filesToModify;
}

export async function findImpactedFiles(filesToModify: TFile[]): Promise<TFile[]> {
  const impactedFiles: TFile[] = [];

  for (const file of filesToModify) {
    const content = await fs.readFile(file.path, 'utf8');
    const importMatches = content.match(/import .* from ['"](.+)['"]/g) || [];

    for (const match of importMatches) {
      const importPath = match.match(/['"](.+)['"]/)?.[1];
      if (importPath) {
        const fullPath = path.resolve(path.dirname(file.path), importPath);
        const isFileImpacted = await fs.stat(fullPath).then(() => true).catch(() => false);

        if (isFileImpacted) {
          impactedFiles.push({ path: fullPath, content: await fs.readFile(fullPath, 'utf8') });
        }
      }
    }
  }

  return impactedFiles;
}

export async function applyChanges(response: TResponse): Promise<void> {
  if (response.status === 'error') {
    console.error(response.message);
    return;
  }

  const { modifiedFiles, filesToDelete } = response.data;

  for (const file of modifiedFiles) {
    try {
      await fs.writeFile(file.path, file.content, 'utf8');
      console.log(`Updated file: ${file.path}`);
    } catch (error) {
      console.error(`Error writing to file ${file.path}:`, error);
    }
  }

  for (const filePath of filesToDelete) {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}