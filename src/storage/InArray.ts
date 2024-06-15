import { Logger } from '../Logger.js'
import { SyncStorage } from './index.js'

const DEFAULT_LIMIT = 2
const DEFAULT_LOG_LABEL = 'Memory storage'

interface InArrayOptions {
	limit?: number
}

export class InArray<Record> implements SyncStorage<Record> {
	private readonly logger: Logger
	private readonly options: InArrayOptions
	private records: Record[]

	constructor(options: InArrayOptions) {
		this.options = options
		this.records = []
		this.logger = new Logger({ label: DEFAULT_LOG_LABEL, type: 'storage' })

		this.logger.info('Memory storage initialized')
	}

	saveRecords(records: Record[]) {
		this.records.push(...records)
		this.logger.info('Record saved')
	}

	getRecords() {
		this.logger.info('Records gotten')
		return this.records.slice(-this.options.limit || DEFAULT_LIMIT)
	}
}
