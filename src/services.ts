import { TFile, TResponse } from './types'

const API_URL = 'https://sdk.featuresflow.com/v1'

export const getStaleFlags = async (authenticationKey: string): Promise<string[]> => {
  const res = await fetch(
    `${API_URL}/bot/stale`,
    {
      method: 'POST',
      body: JSON.stringify({authenticationKey}),
      headers: {
        'Content-Type': 'application/json'
      }
    })

  if(!res.ok) {
    return []
  }

  const data = await res.json()

  return data.features
}


export const removeFlagsFromFiles = async (files: TFile[], flags: string[], authenticationKey: string): Promise<TResponse> => {
  const res = await fetch(
    `${API_URL}/bot/remove`,
    {
      method: 'POST',
      body: JSON.stringify({files, flags, authenticationKey}),
      headers: {
        'Content-Type': 'application/json'
      }
    })

  console.log(res)

  const x = await res.json()

  console.log(x)

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