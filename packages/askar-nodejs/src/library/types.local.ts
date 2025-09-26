// types.local.ts
export type FfiArg = number | string | Buffer | null | undefined
export type ArgMap = Record<string, FfiArg>

export interface StoreRenameProfileOptions {
  storeHandle: number
  fromProfile: string
  toProfile: string
}

export interface StoreCopyProfileOptions {
  fromHandle: number
  toHandle: number
  fromProfile: string
  toProfile?: string | null 
}
export interface EntryListGetTagsOptions {
  entryListHandle: Buffer; // ArcHandle<void*> → Buffer
  index: number;           // i32 → number
}