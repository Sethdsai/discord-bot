const WebSocket = require('ws');
const https = require('https');

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

let ws = null;
let heartbeatInterval = null;
let sequence = null;
let sessionId = null;
let botInfo = null;

function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

function apiCall(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'discord.com',
            path: `/api/v10${endpoint}`,
            method: method,
            headers: {
                'Authorization': `Bot ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data ? JSON.parse(data) : {});
                } else {
                    reject(new Error(`API Error: ${res.statusCode} ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function connect() {
    if (!TOKEN) {
        log('ERROR: No DISCORD_TOKEN set');
        return;
    }

    log('Connecting to Discord Gateway...');

    ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

    ws.on('open', () => log('WebSocket connected'));

    ws.on('message', async (data) => {
        const payload = JSON.parse(data);

        if (payload.s) sequence = payload.s;

        switch (payload.op) {
            case 10: // Hello
                const hbInterval = payload.d.heartbeat_interval;
                heartbeatInterval = setInterval(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ op: 1, d: sequence }));
                        log('Heartbeat sent');
                    }
                }, hbInterval);

                // Identify
                ws.send(JSON.stringify({
                    op: 2,
                    d: {
                        token: TOKEN,
                        intents: 513, // Guilds + GuildMessages + DMs
                        properties: {
                            os: 'linux',
                            browser: 'node',
                            device: 'bot'
                        },
                        presence: {
                            status: 'online',
                            activities: [{ name: 'GitHub Pages Bot', type: 0 }]
                        }
                    }
                }));
                break;

            case 0: // Dispatch
                if (payload.t === 'READY') {
                    botInfo = payload.d.user;
                    sessionId = payload.d.session_id;
                    log(`Logged in as ${botInfo.username}#${botInfo.discriminator}`);
                    log(`In ${payload.d.guilds.length} servers`);
                }

                if (payload.t === 'MESSAGE_CREATE') {
                    const msg = payload.d;
                    log(`[MSG] ${msg.author.username}: ${msg.content}`);

                    // Handle commands
                    if (msg.content === '!ping') {
                        await sendMessage(msg.channel_id, 'Pong! 🏓');
                    }
                    if (msg.content === '!hello') {
                        await sendMessage(msg.channel_id, `Hello ${msg.author.username}! 👋`);
                    }
                    if (msg.content === '!status') {
                        await sendMessage(msg.channel_id, `Bot is online! Running on Node.js`);
                    }
                    if (msg.content.startsWith('!say ')) {
                        const text = msg.content.slice(5);
                        await sendMessage(msg.channel_id, text);
                    }
                }
                break;

            case 11: // Heartbeat ACK
                log('Heartbeat ACK');
                break;
        }
    });

    ws.on('error', (e) => log(`WebSocket error: ${e.message}`));
    ws.on('close', (code, reason) => {
        log(`Disconnected: ${code} ${reason}`);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        // Reconnect after 5 seconds
        setTimeout(connect, 5000);
    });
}

async function sendMessage(channelId, content) {
    try {
        await apiCall('POST', `/channels/${channelId}/messages`, { content });
        log(`Message sent to ${channelId}: ${content}`);
    } catch (e) {
        log(`Failed to send message: ${e.message}`);
    }
}

// Keep alive for hosting platforms
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    log(`HTTP server listening on port ${PORT}`);
    connect();
});

// Handle shutdown
process.on('SIGTERM', () => {
    log('Shutting down...');
    if (ws) ws.close();
    server.close();
});
