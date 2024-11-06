import * as core from '@actions/core'

import { getStaleFlags, removeFlagsFromFiles } from './services'
import { findFilesWithFlags } from './utils'
import { applyChanges } from './git'

export async function run() {
  const directory = core.getInput('directory');
  const authKey = core.getInput('auth_key')
  const flags = await getStaleFlags(authKey);

  if (flags.length === 0) {
    console.log('No stale flags found');
    return;
  }

  const filesToModify = await findFilesWithFlags(directory, flags);

  const response = await removeFlagsFromFiles(filesToModify, flags, authKey);

  if(response.status === 'error') {
    core.setFailed(response.message);
    return;
  }

  await applyChanges(response);
}