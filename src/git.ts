import { TResponse } from './types'
import fs from 'fs/promises'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { exec } from '@actions/exec'

async function configureGit() {
  try {
    await exec('git', [
      'config',
      'user.name',
      'github-actions[bot]'
    ]);

    await exec('git', [
      'config',
      'user.email',
      'github-actions[bot]@users.noreply.github.com'
    ]);
  } catch (error) {
    core.error(`Failed to configure git user: ${error}`);
    throw error;
  }
}

async function commitChanges(message: string): Promise<void> {
  try {
    await configureGit();

    await exec('git', ['add', '.']);

    await exec('git', ['commit', '-m', message]);

    core.debug('Changes committed successfully');
  } catch (error) {
    core.error(`Failed to commit changes: ${error}`);
    throw error;
  }
}

async function createBranch(branchName: string): Promise<void> {
  try {
    await exec('git', ['checkout', '-b', branchName]);
    core.debug(`Created and checked out branch: ${branchName}`);
  } catch (error) {
    core.error('Failed to create branch');
    throw error;
  }
}

async function pushChanges(branchName: string): Promise<void> {
  try {
    await exec('git', ['push', 'origin', branchName]);
    core.debug(`Pushed changes to branch: ${branchName}`);
  } catch (error) {
    core.error('Failed to push changes');
    throw error;
  }
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

  const timestamp = new Date().getTime();
  const branchName = `featuresflow/cleanup-${timestamp}`;

  try {
    await createBranch(branchName);

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

    await commitChanges('Remove stale feature flags');
    await pushChanges(branchName);

    await createPullRequest(branchName);

    core.setOutput('branch_name', branchName);
    core.setOutput('modified_files', results.success.modified);
    core.setOutput('deleted_files', results.success.deleted);
    core.setOutput('failed_operations', results.failed.modified + results.failed.deleted);
  } catch (error) {
    core.setFailed(`Failed to apply changes: ${error}`);
    throw error;
  }
}

export async function createPullRequest(branchName: string) {
  const token = core.getInput('github_token', { required: true });
  const baseBranch = core.getInput('base_branch', { required: false }) || 'main';
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  try {
    const { data: pullRequest } = await octokit.rest.pulls.create({
      owner,
      repo,
      head: branchName,
      base: baseBranch,
      title: 'Remove Stale Feature Flags',
      body: [
        '## Feature Flag Cleanup',
        '',
        'This PR removes stale feature flags and associated code. This is an automated PR created by the FeaturesFlow.',
        '',
        'Please review the changes carefully before merging.',
      ].join('\n'),
    });

    core.info(`Pull request created: ${pullRequest.html_url}`);
    core.setOutput('pull_request_url', pullRequest.html_url);
  } catch (error) {
    core.error('Failed to create pull request: ' + error);
    throw error;
  }
}