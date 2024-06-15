import { Logger } from '../Logger.js'
import { AsyncStorage } from './index.js'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'

const DEFAULT_LIMIT = 2
const DEFAULT_LOG_LABEL = 'File storage'

interface LowDbOptions {
	limit?: number
}

export class LowDb<Record> implements AsyncStorage<Record> {
	private readonly logger: Logger
	private readonly options: LowDbOptions
	private db: Low<Record[]>

	constructor(options: LowDbOptions) {
		this.options = options
		this.logger = new Logger({ label: DEFAULT_LOG_LABEL, type: 'storage' })
	}

	async init() {
		try {
			this.db = await JSONFilePreset<Record[]>('db.json', [])
			this.logger.info('Initialized to DB')
		} catch (error) {
			this.logger.error(`Failed to initialized DB. ${error}`)
		}
	}

	async saveRecords(records: Record[]) {
		try {
			this.db.data.push(...records)
			await this.db.write()

			this.logger.info('Record saved')
		} catch (error) {
			this.logger.error(`Failed to save record. ${error}`)
		}
	}

	// shitcode
	// eslint-disable-next-line
	async getRecords() {
		try {
			this.logger.info('Records gotten')
			return this.db.data.slice(-this.options.limit || DEFAULT_LIMIT)
		} catch (error) {
			this.logger.error(`Failed to get records. ${error}`)
		}
	}
}
