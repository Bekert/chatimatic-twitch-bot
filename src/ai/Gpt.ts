import { Schema } from 'mongoose'
import OpenAI from 'openai'
import { Logger } from '../Logger.js'
import { AsyncStorage, SyncStorage } from '../storage/index.js'

const DEFAULT_LOG_LABEL = 'GPT'

// for MongoDB
export const gptMongoSchema = new Schema<GptRecord>(
	{
		user: { type: String, required: true },
		message: { type: String, required: true }
	},
	{ timestamps: true }
)

export interface GptRecord {
	user: string
	message: string
}

interface GptOptions {
	apiKey: string
	modelType: OpenAI.Chat.ChatModel
	defaultInputs?: string[]
	storage?: AsyncStorage<GptRecord> | SyncStorage<GptRecord>
}

export class GPT {
	private readonly options: GptOptions
	private readonly provider: OpenAI
	private readonly defaultInputs: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	private logger: Logger

	constructor(options: GptOptions) {
		this.options = options
		this.defaultInputs = options.defaultInputs
			? options.defaultInputs.map(value => ({ role: 'system', content: value }))
			: []

		this.provider = new OpenAI({ apiKey: options.apiKey })
		this.logger = new Logger({ label: DEFAULT_LOG_LABEL, type: 'ai' })
	}

	async interact(input: string, user: string) {
		try {
			if (this.options.storage) {
				this.logger.info('Using storage')
				const records = await this.options.storage.getRecords()

				const inputs: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = records.map(
					({ user, message }) => {
						const role = user === 'llm' ? 'assistant' : 'user'
						return user
							? { name: user, role, content: message }
							: { role, content: message }
					}
				)

				this.logger.info(
					// eslint-disable-next-line
					`Using ${inputs.length + this.defaultInputs.length} inputs with ${records.length} context records`
				)

				const output = await this.provider.chat.completions.create({
					model: this.options.modelType,
					messages: [
						...this.defaultInputs,
						...inputs,
						{ role: 'user', name: user, content: input }
					]
				})
				const message = output.choices[0].message.content

				// we don't have to await data write to db, but we have to save it in order
				this.logger.info('Saving input and output to storage')
				void this.options.storage.saveRecords([
					{ user, message: input },
					{ user: 'llm', message }
				])

				return message
			} else {
				const output = await this.provider.chat.completions.create({
					model: this.options.modelType,
					messages: [...this.defaultInputs, { role: 'user', content: input, name: user }]
				})
				const message = output.choices[0].message.content
				return message
			}
		} catch (error) {
			this.logger.error(`Failed to interact. ${error}`)
		}
	}
}
