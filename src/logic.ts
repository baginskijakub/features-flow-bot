import core from '@actions/core';
import { getStaleFlags, removeFlagsFromFiles } from './services';
import { applyChanges, findFilesWithFlags, findImpactedFiles } from './utils'

export async function run() {
  const directory = core.getInput('directory');
  const authKey = core.getInput('auth_key');
  const flags = await getStaleFlags(authKey);

  if (flags.length === 0) {
    console.log('No stale flags found');
    return;
  }

  const filesToModify = await findFilesWithFlags(directory, flags);
  const impactedFiles = await findImpactedFiles(filesToModify);

  const response = await removeFlagsFromFiles([...filesToModify, ...impactedFiles], flags);

  await applyChanges(response);
}