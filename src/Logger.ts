import { pino, Logger as PinoLogger } from 'pino'

interface LoggerOptions {
	label: string
	type: 'ai' | 'storage' | 'twitch'
}

const rootLogger = pino({
	transport: {
		target: 'pino-pretty',
		options: {
			messageFormat: '({type}) {label}: {msg}',
			hideObject: true
		}
	}
})

export class Logger {
	private readonly options: LoggerOptions
	private readonly logger: PinoLogger

	constructor(options: LoggerOptions) {
		this.options = options
		this.logger = rootLogger.child({ label: this.options.label, type: this.options.type })
	}

	info(message: string) {
		this.logger.info(message)
	}

	error(message: string) {
		this.logger.error(message)
	}

	warn(message: string) {
		this.logger.warn(message)
	}
}
