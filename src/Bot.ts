import { Client, Options } from 'tmi.js'
import { Logger } from './Logger.js'

interface IBotInteraction {
	trigger: (input: string) => boolean
	action: (user: string, message: string) => string | string[] | Promise<string | string[]>
}

interface IBotOptions {
	interactions: IBotInteraction[]
}

export class Bot {
	private twitch: Client
	private logger: Logger

	constructor(tmiOptions: Options, botOptions: IBotOptions, logger: Logger) {
		this.logger = logger
		this.twitch = new Client(tmiOptions)

		this.twitch.on('message', (channel, tags, message, self) => {
			try {
				this.logger.msg(`BOT: ${tags.username}: ${message}`)
				if (self) return

				for (const { trigger, action } of botOptions.interactions) {
					void (async () => {
						this.logger.msg(
							`BOT: Trigger ${trigger(message) ? 'matched' : 'not matched'}`
						)
						if (trigger(message)) {
							const output = await action(tags.username, message)
							if (!output) {
								this.logger.error('BOT: No output')
								return
							}

							if (Array.isArray(output)) {
								this.logger.msg(`BOT: Sending ${output.length} messages`)
								for (const msg of output) {
									await this.twitch.say(channel, msg)
									await new Promise(res => setTimeout(res, 3000))
								}
							} else {
								this.logger.msg('BOT: Sending message')
								void this.twitch.say(channel, output)
							}
						}
					})()
				}
			} catch (error) {
				this.logger.error(`BOT: ${error}`)
			}
		})
	}

	async connect() {
		try {
			await this.twitch.connect()
			this.logger.msg('BOT: Connected to Twitch')
		} catch (error) {
			this.logger.error(`BOT: ${error}`)
		}
	}
}
