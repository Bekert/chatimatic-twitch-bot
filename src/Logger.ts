export class Logger {
	public logging: boolean

	public msg(message: string): void {
		if (this.logging) {
			console.log(message)
		}
	}

	public error(message: string): void {
		if (this.logging) {
			console.error(message)
		}
	}
}
