import { TFile, TResponse } from './types'

const API_URL = 'https://sdk.featuresflow.com/v1'

export const getStaleFlags = async (authenticationKey: string): Promise<string[]> => {
  const res = await fetch(
    `${API_URL}/bot/stale`,
    {
      method: 'POST',
      body: JSON.stringify({ authenticationKey }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.features;
}

const batchRemove = async (files: TFile[], flags: string[], authenticationKey: string): Promise<TResponse> => {
  const res = await fetch(
    `${API_URL}/bot/remove`,
    {
      method: 'POST',
      body: JSON.stringify({ files, flags, authenticationKey }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!res.ok) {
    return {
      status: 'error',
      message: 'Failed to remove flags from files'
    }
  }

  const data = await res.json();

  return {
    status: 'success',
    message: 'Flags removed successfully',
    data
  }
}

export const removeFlagsFromFiles = async (files: TFile[], flags: string[], authenticationKey: string): Promise<TResponse> => {
  const batches: TFile[][] = [];
  for (let i = 0; i < files.length; i += 3) {
    batches.push(files.slice(i, i + 3));
  }

  let allModifiedFiles: TFile[] = [];
  let allFilesToRemove: string[] = [];

  for (const batch of batches) {
    const response = await batchRemove(batch, flags, authenticationKey);

    if (response.status === 'success') {
      allModifiedFiles = allModifiedFiles.concat(response.data.modifiedFiles);

      if(response.data.filesToDelete) {
        allFilesToRemove = allFilesToRemove.concat(response.data.filesToDelete);
      }
    } else {
      return {
        status: 'error',
        message: 'Failed to remove flags from one or more batches'
      };
    }
  }

  return {
    status: 'success',
    message: 'Flags removed successfully from all files',
    data: {
      modifiedFiles: allModifiedFiles,
      filesToDelete: allFilesToRemove
    }
  };
}
