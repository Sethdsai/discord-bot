# Discord Bot - 24/7 Hosting

A Node.js Discord bot that runs 24/7 for free.

## One-Click Deploy

Choose a platform and click to deploy:

### Render (Recommended - Free)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Sethdsai/discord-bot)

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Sethdsai/discord-bot)

### Fly.io
[![Deploy to Fly.io](https://fly.io/buttons/deploy.svg)](https://fly.io/launch?repo=https://github.com/Sethdsai/discord-bot)

## Setup

1. Click one of the deploy buttons above
2. Connect your GitHub account
3. Add environment variable:
   - `DISCORD_TOKEN` = your bot token
4. Deploy!

## Bot Commands

- `!ping` - Pong!
- `!hello` - Says hello
- `!status` - Bot status
- `!say <message>` - Bot repeats message

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes | Your Discord bot token |
| `GUILD_ID` | No | Server ID for testing |

## Local Development

```bash
npm install
DISCORD_TOKEN=your_token npm start
```
