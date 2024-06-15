import { Logger } from '../Logger.js'
import { AsyncStorage } from './index.js'
import { Model, model, Schema, connect } from 'mongoose'

const DEFAULT_COLLECTION_NAME = 'chatimaticMongoRecords'
const DEFAULT_LIMIT = 2
const DEFAULT_LOG_LABEL = 'MongoDB'

interface MongoOptions<Record> {
	url: string
	schema: Schema<Record>
	limit?: number
	collectionName?: string
}

export class Mongo<Record> implements AsyncStorage<Record> {
	private readonly logger: Logger
	private readonly options: MongoOptions<Record>
	private Model: Model<Record>

	constructor(options: MongoOptions<Record>) {
		this.options = options
		this.logger = new Logger({ label: DEFAULT_LOG_LABEL, type: 'storage' })
	}

	async init() {
		try {
			await connect(this.options.url)
			this.logger.info('Connected to DB')

			this.Model = model<Record>(
				'Record',
				this.options.schema,
				this.options.collectionName || DEFAULT_COLLECTION_NAME
			)
		} catch (error) {
			this.logger.error(`Failed to connect to DB. ${error}`)
		}
	}

	async saveRecords(records: Record[]) {
		try {
			await this.Model.insertMany(records)

			this.logger.info('Record saved')
		} catch (error) {
			this.logger.error(`Failed to save record. ${error}`)
		}
	}

	async getRecords() {
		try {
			const records = await this.Model.find()
				.sort({ createdAt: -1 })
				.limit(this.options.limit || DEFAULT_LIMIT)

			this.logger.info('Records gotten')
			return records.reverse() as Record[]
		} catch (error) {
			this.logger.error(`Failed to get records. ${error}`)
		}
	}
}
