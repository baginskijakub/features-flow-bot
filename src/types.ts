export interface TFile {
  path: string
  content: string
}

export interface TModifyEndpointResponse {
  modifiedFiles: TFile[]
  filesToDelete: string[]
}

export type TResponse = {
  status: 'error'
  message: string

} | {
  status: 'success'
  message: string
  data: TModifyEndpointResponse
}