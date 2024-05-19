import { Model, model, Schema } from 'mongoose'
import OpenAI, { ClientOptions } from 'openai'

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

	constructor({ defaultInputs, inputsLimit, modelType, ...options }: IGPT) {
		this.modelType = modelType
		this.defaultInputs = defaultInputs
			? defaultInputs.map(value => ({ role: 'system', content: value }))
			: []
		this.inputsLimit = inputsLimit || 5

		this.provider = new OpenAI(options)

		this.History = model<IHistory>('GPTHistory', historySchema)
	}

	async interact(input: string, user?: string, useHistory?: boolean) {
		try {
			if (useHistory) {
				const records = await this.History.find()
					.sort({ createdAt: -1 })
					.limit(this.inputsLimit)
				const inputs: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = records
					.reverse()
					.map(({ user, message }) => ({
						role: user === 'llm' ? 'assistant' : 'user',
						name: user === 'llm' ? undefined : user,
						content: message
					}))

				const output = await this.provider.chat.completions.create({
					model: this.modelType,
					messages: [...this.defaultInputs, ...inputs, { role: 'user', content: input }]
				})
				console.log('output', output)
				const message = output.choices[0].message.content

				const newUserRecord = new this.History({ user, message: input })
				void newUserRecord.save()
				const newLLVRecord = new this.History({ user: 'llm', message })
				void newLLVRecord.save()

				return message
			} else {
				const output = await this.provider.chat.completions.create({
					model: this.modelType,
					messages: [...this.defaultInputs, { role: 'user', content: input }]
				})
				const message = output.choices[0].message.content
				return message
			}
		} catch (error) {
			console.log(error)
			return null
		}
	}
}
