import mongoose from 'mongoose'
import { GPT } from './GPT.js'
import { Bot } from './Bot.js'

const gpt = new GPT({
	apiKey: process.env['OPENAI_API_KEY'],
	modelType: 'gpt-4',
	inputsLimit: 2,
	defaultInputs: ['Тебе звуть Василій. Ти бот донбаського походження']
})
const bot = new Bot(
	{
		identity: {
			username: 'muga_maga',
			password: `oauth:${process.env['TWITCH_API_KEY']}`
		},
		channels: ['safrit22']
	},
	{
		interactions: [
			{
				trigger: /^@?muga_maga/gm,
				action: async (user, message) => {
					const input = /^@?muga_maga(?: |, )(.*)/gm.exec(message)[1]

					const output = await gpt.interact(input, user, true)

					return `@${user} ${output}`
				}
			}
		]
	}
)

void bot.connect()
void mongoose.connect(process.env['DB_URL'])
