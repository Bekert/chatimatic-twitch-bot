import { Bot } from './Bot.js'
import { getConfig } from './config.js'
import * as storageManager from './storage/index.js'
import * as aiManager from './ai/index.js'

const config = await getConfig()

let ai: aiManager.GPT

if (config.aiType === 'gpt') {
	let storage:
		| storageManager.AsyncStorage<aiManager.GptRecord>
		| storageManager.SyncStorage<aiManager.GptRecord>

	if (config.storageType === 'mongo') {
		storage = new storageManager.Mongo({
			url: config.mongo.url,
			schema: aiManager.gptMongoSchema,
			limit: config.gpt.inputsLimit
		})
		await storage.init()
	} else if (config.storageType === 'file') {
		storage = new storageManager.LowDb({
			limit: config.gpt.inputsLimit
		})
		await storage.init()
	} else if (config.storageType === 'memory') {
		storage = new storageManager.InArray({
			limit: config.gpt.inputsLimit
		})
	}

	ai = new aiManager.GPT({
		apiKey: config.gpt.apiKey,
		modelType: config.gpt.modelType,
		defaultInputs: config.gpt.defaultInputs,
		storage
	})
}

const bot = new Bot(
	{
		identity: {
			username: config.twitch.username,
			password: `oauth:${config.twitch.apiKey}`
		},
		channels: [config.twitch.channel]
	},
	{
		interactions: [
			{
				trigger: input => /^@?muga_maga/gm.test(input),
				action: async (user, message) => {
					const input = /^@?muga_maga(?: |, )(.*)/gm.exec(message)[1]

					const output = await ai.interact(input, user)

					const msg = `@${user} ${output}`

					// twitch length limit
					if (msg.length >= 450) {
						return [...msg.replace(/\n/gm, ' ').match(/.{1,400}\. /gm)]
					} else {
						return msg
					}
				}
			}
		]
	}
)

void bot.init()
