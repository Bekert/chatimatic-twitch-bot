# Chatimatic Twitch BOT (WIP)

- [x] Add gpt support
- [X] Add MongoDB support for context storage
- [X] Add file storage for context
- [ ] Create TUI
- [ ] Add support for local models (with [https://github.com/Atome-FE/llama-node])
- [ ] Add GUI

Simple way to run AI chatbots in Twitch chat. Currently works with OpenAI API

## Usage

### Directly

Clone the repo and install dependencies

```Bash
git clone https://github.com/Bekert/chatimatic-twitch-bot.git && cd chatimatic-twitch-bot && npm install --omit=dev
```

Create file `config.json` from `example-config.json`

```Bash
cp example-config.json config.json
```

In the config, you need to provide Twitch API key, channel, username and OpenAI API key

Run the bot

```bash
npm run start
```

Try to ping the bot by username (e. g. `@username hi, who are you?`). It will keep the context of your chat conversation

### TUI (WIP)

### GUI (WIP)

## Configuration

### AI

Currently GPT is the only supported model. Here is how you can configure it

- `apiKey` - your API key
- `model` - model to use (e. g. gpt-4o, gpt-4, gpt-3.5-turbo). You can find the full list and pricing here [https://platform.openai.com/docs/models](https://openai.com/api/pricing/)
- `defaultInputs` - list of default (system) inputs that will be embedded in each request to GPT. I find that 1 short input usually works the best
- `memory` - whether bot should keep the context of the conversatation (requires additional cost for input tokens)
- `inputsLimit` - the number of messages (user's inputs and bot's outputs) that will be used in bot's context. Be aware of input token cost cost

### Storage

3 types of storage are currently supported 

- `memory` - temporarly RAM storage (it clears out when you stop the bot). Requires no further config
- `file` - persistent file-based storage. It will the save the data in `db.json`. Requires no further config
- `mongo` - MongoDB is used for data storage. You will have to provide the DB url
