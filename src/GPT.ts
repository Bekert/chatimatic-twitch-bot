import { Model, model, Schema } from 'mongoose'
import OpenAI, { ClientOptions } from 'openai'
import { Logger } from './Logger.js'

interface IHistory {
	user: string
	message: string
}

const historySchema = new Schema<IHistory>(
	{
		user: { type: String, required: true },
		message: { type: String, required: true }
	},
	{ timestamps: true }
)

interface IGPT extends ClientOptions {
	defaultInputs?: string[]
	inputsLimit?: number
	modelType: OpenAI.Chat.ChatModel
}

export class GPT {
	private provider: OpenAI
	private defaultInputs: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
	private History: Model<IHistory>
	private modelType: OpenAI.Chat.ChatModel
	private inputsLimit: number
	private logger: Logger

	constructor({ defaultInputs, inputsLimit, modelType, ...options }: IGPT, logger: Logger) {
		this.modelType = modelType
		this.logger = logger
		this.defaultInputs = defaultInputs
			? defaultInputs.map(value => ({ role: 'system', content: value }))
			: []
		this.inputsLimit = inputsLimit || 5

		this.provider = new OpenAI(options)

		this.History = model<IHistory>('GPTHistory', historySchema)
	}

	async interact(
		input: string,
		user?: string,
		useHistory?: boolean,
		systemInput?: string | undefined | null
	) {
		try {
			if (useHistory) {
				this.logger.msg('GPT: Using history')
				const records = await this.History.find()
					.sort({ createdAt: -1 })
					.limit(this.inputsLimit)
				const inputs: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = records
					.reverse()
					.map(({ user, message }) => {
						const role = user === 'llm' ? 'assistant' : 'user'
						return user
							? { name: user, role, content: message }
							: { role, content: message }
					})

				if (systemInput) inputs.push({ role: 'system', content: systemInput })

				this.logger.msg(`GPT: Inputs: ${JSON.stringify(inputs)}`)

				const output = await this.provider.chat.completions.create({
					model: this.modelType,
					messages: [
						...this.defaultInputs,
						...inputs,
						{ role: 'user', name: user, content: input }
					]
				})
				const message = output.choices[0].message.content
				this.logger.msg(`GPT: Output: ${message}`)

				// we don't have to await data write to db, but we have to save it in order
				void (async () => {
					const newUserRecord = new this.History({ user, message: input })
					await newUserRecord.save()
					const newLLVRecord = new this.History({ user: 'llm', message })
					void newLLVRecord.save()
					this.logger.msg('GPT: History saved')
				})()

				return message
			} else {
				const output = await this.provider.chat.completions.create({
					model: this.modelType,
					messages: [...this.defaultInputs, { role: 'user', content: input }]
				})
				const message = output.choices[0].message.content
				this.logger.msg(`GPT: Output: ${message}`)
				return message
			}
		} catch (error) {
			this.logger.error(`GPT: ${error}`)
			return null
		}
	}
}
