import { TResponse } from './types'
import fs from 'fs/promises'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { exec } from '@actions/exec'

async function configureGit() {
  try {
    await exec('git', [
      'config',
      '--global',
      'user.name',
      'github-actions[bot]'
    ]);

    await exec('git', [
      'config',
      '--global',
      'user.email',
      '41898282+github-actions[bot]@users.noreply.github.com'
    ]);

    core.debug('Git user configured successfully');
  } catch (error) {
    core.error('Failed to configure git user');
    throw error;
  }
}

async function commitChanges(message: string): Promise<void> {
  try {
    // Configure git user first
    await configureGit();

    // Stage all changes
    await exec('git', ['add', '.']);

    // Create commit
    await exec('git', ['commit', '-m', message]);

    core.debug('Changes committed successfully');
  } catch (error) {
    core.error('Failed to commit changes');
    throw error;
  }
}

async function createBranch(branchName: string): Promise<void> {
  try {
    // Create and checkout new branch
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

  // Generate a unique branch name
  const timestamp = new Date().getTime();
  const branchName = `feature-flag-cleanup-${timestamp}`;

  try {
    // Create new branch
    await createBranch(branchName);

    // Apply file modifications
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

    // Apply file deletions
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

    // Commit and push changes
    await commitChanges('Remove stale feature flags');
    await pushChanges(branchName);

    // Create pull request
    await createPullRequest(branchName);

    // Set outputs
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