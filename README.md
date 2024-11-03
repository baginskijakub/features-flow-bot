# FeaturesFlow Cleanup Action

A GitHub Action to automatically clean up specified feature flags in your codebase. This action scans for feature flags, removes outdated flags from relevant files, and creates a pull request with the changes. 

## Features

- **Automatic feature flag cleanup**: Finds and removes stale feature flags throughout the codebase.
- **Impact analysis**: Identifies files that directly or indirectly reference the specified flags.
- **Pull request creation**: Opens a pull request with changes made, ready for review and merging.

## Inputs

| Input        | Description                             | Required | Default  |
|--------------|-----------------------------------------|----------|----------|
| `directory`  | Directory to search for files           | Yes      | `./src`  |
| `auth_key`   | Authentication key for API requests     | Yes      |          |
| `base_branch`| Base branch to compare and create PR    | No       | `main`   |

## Permissions

This action requires `contents: write` permission to commit changes and create pull requests.

## Usage

To use the FeaturesFlow Cleanup Action, add it as a step in your workflow YAML file.

```yaml
name: Cleanup Feature Flags

on:
  workflow_dispatch:
  schedule:
    - cron: "0 3 * * 0" # Runs every Sunday at 3am UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run FeaturesFlow Cleanup Action
        uses: your-username/featuresflow-cleanup-action@v1
        with:
          directory: './src'
          auth_key: ${{ secrets.FEATURES_FLOW_AUTH_KEY }}
          base_branch: 'main'
```

## Example Workflow with Pull Request

You can set this action up to run on a schedule (e.g., every Sunday at 3 am) or manually via workflow_dispatch. The action will:

- Identify all files with outdated feature flags in the specified directory.
- Remove references to the specified feature flags and clean up related imports and other dependencies.
- Create a pull request against the base branch with the changes.

## Setup
- Authentication Key: Store the auth_key as a secret in your repository (FEATURES_FLOW_AUTH_KEY) for secure access.
- GitHub Token: Ensure GITHUB_TOKEN is available in the action to authenticate API requests and commit changes.

## Troubleshooting
-- Missing Authentication: Ensure auth_key is set correctly and stored as a GitHub secret.
-- Permission Errors: Make sure the action has contents: write permission if it needs to create pull requests.

## License
This project is licensed under the MIT License.
