import { TFile, TResponse } from './types'
import fs from 'fs/promises'
import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

export async function findFilesWithFlags(directory: string, flags: string[]): Promise<TFile[]> {
  const filesToModify: TFile[] = [];

  // Normalize and validate the directory path
  const normalizedDir = path.resolve(process.cwd(), directory);

  try {
    // Check if directory exists
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

export async function findImpactedFiles(filesToModify: TFile[]): Promise<TFile[]> {
  const impactedFiles: TFile[] = [];
  const processedPaths = new Set<string>(); // Prevent duplicate processing

  for (const file of filesToModify) {
    try {
      const content = await fs.readFile(file.path, 'utf8');
      const importMatches = content.match(/import .* from ['"](.+)['"]/g) || [];

      for (const match of importMatches) {
        const importPath = match.match(/['"](.+)['"]/)?.[1];
        if (importPath) {
          try {
            // Handle different import path formats
            let fullPath = importPath;
            if (!path.isAbsolute(importPath)) {
              fullPath = path.resolve(path.dirname(file.path), importPath);
            }

            // Add file extensions if needed
            const extensions = ['.js', '.ts', '.jsx', '.tsx'];
            let resolvedPath = '';

            for (const ext of extensions) {
              const pathWithExt = fullPath + ext;
              if (await fs.stat(pathWithExt).then(() => true).catch(() => false)) {
                resolvedPath = pathWithExt;
                break;
              }
            }

            if (resolvedPath && !processedPaths.has(resolvedPath)) {
              processedPaths.add(resolvedPath);
              impactedFiles.push({
                path: resolvedPath,
                content: await fs.readFile(resolvedPath, 'utf8')
              });
              core.debug(`Found impacted file: ${resolvedPath}`);
            }
          } catch (error) {
            core.debug(`Could not resolve import ${importPath} in ${file.path}: ${error}`);
          }
        }
      }
    } catch (error) {
      core.warning(`Error processing imports in ${file.path}: ${error}`);
    }
  }

  core.info(`Found ${impactedFiles.length} impacted files`);
  return impactedFiles;
}

export async function applyChanges(response: TResponse): Promise<void> {
  if (response.status === 'error') {
    core.setFailed(response.message);
    return;
  }

  const { modifiedFiles, filesToDelete } = response.data;
  const results = {
    success: { modified: 0, deleted: 0 },
    failed: { modified: 0, deleted: 0 }
  };

  for (const file of modifiedFiles) {
    try {
      await fs.writeFile(file.path, file.content, 'utf8');
      core.info(`Updated file: ${file.path}`);
      results.success.modified++;
    } catch (error) {
      core.error(`Error writing to file ${file.path}: ${error}`);
      results.failed.modified++;
    }
  }

  for (const filePath of filesToDelete) {
    try {
      await fs.unlink(filePath);
      core.info(`Deleted file: ${filePath}`);
      results.success.deleted++;
    } catch (error) {
      core.error(`Error deleting file ${filePath}: ${error}`);
      results.failed.deleted++;
    }
  }

  // Set output for GitHub Actions
  core.setOutput('modified_files', results.success.modified);
  core.setOutput('deleted_files', results.success.deleted);
  core.setOutput('failed_operations', results.failed.modified + results.failed.deleted);
}