import React, { useState, useEffect } from 'react'
import { render, Text, Box } from 'ink'
import { spawn } from 'child_process'

const bot = spawn('node', ['./dist/src/index.js'])

interface Log {
	level: number
	time: number
	label: string
	type: 'ai' | 'storage' | 'twitch'
	msg: string
}

function parseLog(data: string): Log[] | void {
	try {
		const dataArr = data.split('\n').filter(Boolean)
		return dataArr
			.map(dataLog => {
				const result = JSON.parse(dataLog) as Log
				if (result.level && result.time && result.label && result.type && result.msg) {
					return result
				}
			})
			.filter(Boolean)
	} catch (error) {
		console.log(error)
		return
	}
}

interface FullScreenProps {
	children: React.ReactNode
}

const FullScreen = (props: FullScreenProps) => {
	const [size, setSize] = React.useState({
		columns: process.stdout.columns,
		rows: process.stdout.rows
	})

	React.useEffect(() => {
		function onResize() {
			setSize({
				columns: process.stdout.columns,
				rows: process.stdout.rows
			})
		}

		process.stdout.on('resize', onResize)
		process.stdout.write('\x1b[?1049h')
		return () => {
			process.stdout.off('resize', onResize)
			process.stdout.write('\x1b[?1049l')
		}
	}, [])

	return (
		<Box width={size.columns} height={size.rows}>
			{props.children}
		</Box>
	)
}

const App = () => {
	console.log('App component rendered')
	const [logs, setLogs] = useState<Log[]>([])

	useEffect(() => {
		bot.stdout.on('data', (data: Buffer) => {
			console.log(data.toString())
			const logsOutput: Log[] | void = parseLog(data.toString('utf-8'))
			if (!logsOutput) {
				return
			}
			setLogs(prev => [...prev, ...logsOutput])
		})
	}, [])

	return (
		<FullScreen>
			<Box>
				<Box
					width={'33%'}
					flexDirection='column'
					borderStyle={'classic'}
					borderColor={'green'}
				>
					<Box justifyContent='center'>
						<Text>AI</Text>
					</Box>
					{logs
						.filter(({ type }) => type === 'ai')
						.map((log, i) => (
							<Text key={i}>
								[{new Date(log.time).toLocaleTimeString()}] {log.msg}
							</Text>
						))}
				</Box>
				<Box
					width={'33%'}
					flexDirection='column'
					borderStyle={'classic'}
					borderColor={'blue'}
				>
					<Box justifyContent='center'>
						<Text>Storage</Text>
					</Box>
					{logs
						.filter(({ type }) => type === 'storage')
						.map((log, i) => (
							<Text key={i}>
								[{new Date(log.time).toLocaleTimeString()}] {log.msg}
							</Text>
						))}
				</Box>
				<Box
					width={'33%'}
					flexDirection='column'
					borderStyle={'classic'}
					borderColor={'red'}
				>
					<Box justifyContent='center'>
						<Text>Twitch</Text>
					</Box>
					{logs
						.filter(({ type }) => type === 'twitch')
						.map((log, i) => (
							<Text key={i}>
								[{new Date(log.time).toLocaleTimeString()}] {log.msg}
							</Text>
						))}
				</Box>
			</Box>
		</FullScreen>
	)
}

render(<App />)
