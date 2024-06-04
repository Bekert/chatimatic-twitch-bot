import mongoose from 'mongoose'
import { GPT } from './GPT.js'
import { Bot } from './Bot.js'
import { getConfig } from './config.js'
import { Logger } from './Logger.js'

const config = await getConfig()

const logger = new Logger()
logger.logging = config.logs

const gpt = new GPT(
	{
		apiKey: config.gpt.apiKey,
		modelType: config.gpt.modelType,
		inputsLimit: config.gpt.inputsLimit,
		defaultInputs: config.gpt.defaultInputs
	},
	logger
)
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

					const output = await gpt.interact(input, user, config.gpt.memory)

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
	},
	logger
)

void bot.connect()
void mongoose.connect(config.mongo.url).then(() => logger.msg('MONGO: Connected to DB'))
