export interface AsyncStorage<Record> {
	init: () => Promise<void>
	saveRecords: (records: Record[]) => Promise<void>
	getRecords: () => Promise<Record[]>
}

export interface SyncStorage<Record> {
	saveRecords: (records: Record[]) => void
	getRecords: () => Record[]
}

export * from './Mongo.js'
export * from './InArray.js'
