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

	constructor(tmiOptions: Options, botOptions: IBotOptions) {
		this.logger = new Logger({ label: 'BOT', type: 'twitch' })
		this.twitch = new Client(tmiOptions)

		this.twitch.on('message', (channel, tags, message, self) => {
			try {
				if (self) return
				this.logger.info(`Message from ${tags.username}: ${message}`)

				for (const { trigger, action } of botOptions.interactions) {
					void (async () => {
						if (trigger(message)) {
							this.logger.info(`Triggered by ${tags.username}`)
							const output = await action(tags.username, message)
							if (!output) {
								this.logger.error('No output')
								return
							}

							if (Array.isArray(output)) {
								this.logger.info(
									`Received long output. Splitting into ${output.length} messages`
								)
								for (const msg of output) {
									this.logger.info(`Sending message: ${msg}`)
									await this.twitch.say(channel, msg)
									await new Promise(res => setTimeout(res, 3000))
								}
							} else {
								this.logger.info(`Sending message: ${output}`)
								void this.twitch.say(channel, output)
							}
						}
					})()
				}
			} catch (error) {
				this.logger.error(`Failed to process message. ${error}`)
			}
		})
	}

	async init() {
		try {
			await this.twitch.connect()
			this.logger.info('Connected to Twitch')
		} catch (error) {
			this.logger.error(`Failed to connect to Twitch. ${error}`)
		}
	}
}
