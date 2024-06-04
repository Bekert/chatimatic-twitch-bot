import OpenAI from 'openai'

interface IConfig {
	twitch?: {
		apiKey?: string
		channel: string
		username: string
	}
	gpt?: {
		apiKey: string
		modelType?: OpenAI.Chat.ChatModel
		memory?: boolean
		inputsLimit?: number
		defaultInputs?: string[]
	}
	mongo?: {
		url: string
	}
	logs?: boolean
}

export async function getConfig() {
	try {
		const config: IConfig = {}
		const { default: data } = (await import('../config.json', { with: { type: 'json' } })) as {
			default: IConfig
		}

		if (data.twitch) {
			const apiKey = process.env['TWITCH_API_KEY'] || data.twitch.apiKey
			const channel = data.twitch.channel
			const username = data.twitch.username

			if (!apiKey) throw new Error('Twitch API key is required')
			if (!channel) throw new Error('Twitch channel is required')
			if (!username) throw new Error('Twitch username is required')

			config.twitch = { apiKey, channel, username }
		} else {
			throw new Error('Twitch config is required')
		}

		if (data.gpt) {
			const apiKey = process.env['OPENAI_API_KEY'] || data.gpt.apiKey
			if (!apiKey) throw new Error('GPT API key is required')

			const modelType = data.gpt.modelType || 'gpt-4o'
			const defaultInputs = data.gpt.defaultInputs || []
			const memory = data.gpt.memory || false
			const inputsLimit = data.gpt.inputsLimit || 4

			config.gpt = { apiKey, modelType, defaultInputs, memory, inputsLimit }
		} else {
			throw new Error('GPT config is required')
		}

		if (data.mongo) {
			const url = process.env['DB_URL'] || data.mongo.url
			if (!url) throw new Error('MongoDB URL is required')

			config.mongo = { url }
		} else {
			throw new Error('MongoDB config is required')
		}

		config.logs = data.logs || false

		return config
	} catch (error) {
		throw new Error('Error while reading config file: ' + error)
	}
}
