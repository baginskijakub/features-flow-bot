import * as core from '@actions/core'

import { getStaleFlags, removeFlagsFromFiles } from './services'
import { applyChanges, createPullRequest, findFilesWithFlags, findImpactedFiles } from './utils'

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

  const response = await removeFlagsFromFiles([...filesToModify, ...impactedFiles], flags, authKey);

  await applyChanges(response);

  const branchName = `remove-feature-flags-${Date.now()}`;
  const exec = require('child_process').execSync;
  exec(`git checkout -b ${branchName}`);
  exec(`git add .`);
  exec(`git commit -m "Remove stale feature flags"`);
  exec(`git push origin ${branchName}`);

  await createPullRequest(branchName);
}