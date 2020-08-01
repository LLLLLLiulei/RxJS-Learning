export interface Chunk {
  start: number
  end: number
  data?: Blob
}

export interface UploadFile {
  file: File
  md5: string
  chunks: Chunk[]
}

export enum EventType {
  Progress = 'progress',
  Start = 'start',
  Pause = 'pause',
  Resume = 'resume',
}

export interface UploadEvent {
  type: EventType
  data: any
}

export interface UploadParams {
  chunkNumber: number
  identifier: string
  filename: string
  relativePath: string
  totalChunks: number
  file?: Blob
}
