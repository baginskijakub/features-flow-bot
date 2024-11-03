import { TFile, TResponse } from './types'

const API_URL = 'https://sdk.featuresflow.com/v1/'

export const getStaleFlags = async (authKey: string): Promise<string[]> => {
  const res = await fetch(
    `${API_URL}/bot/stale`,
    {
      body: JSON.stringify({authKey})
    })


  if(!res.ok) {
    return []
  }

  return await res.json().then(data => data.flags)
}


export const removeFlagsFromFiles = async (files: TFile[], flags: string[]): Promise<TResponse> => {
  const res = await fetch(
    `${API_URL}/bot/remove`,
    {
      body: JSON.stringify({files, flags})
    })

  if(!res.ok) {
    return {
      status: 'error',
      message: 'Failed to remove flags from files'
    }
  }

  const data = await res.json()

  return {
    status: 'success',
    message: 'Flags removed successfully',
    data
  }
}