import { Client, Options } from 'tmi.js'

interface IBotInteraction {
	trigger: RegExp
	action: (user: string, message: string) => string | Promise<string>
}

interface IBotOptions {
	interactions: IBotInteraction[]
}

export class Bot {
	twitch: Client
	constructor(tmiOptions: Options, botOptions: IBotOptions) {
		this.twitch = new Client(tmiOptions)

		this.twitch.on('message', (channel, tags, message, self) => {
			if (self) return
			message = message.toLowerCase()

			for (const { trigger, action } of botOptions.interactions) {
				void (async () => {
					if (trigger.test(message)) {
						const output = await action(tags.username, message)
						console.log(output)
						void this.twitch.say(channel, output)
					}
				})()
			}
		})
	}

	async connect() {
		return this.twitch.connect()
	}
}
