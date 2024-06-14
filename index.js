const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

let sock; // Variable to hold the WhatsApp connection

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        sock = makeWASocket({
            logger: pino().child({ level: 'silent', stream: 'store' }),
            printQRInTerminal: false, // Set to true if you want to print QR code in terminal
            auth: state,
        });

        // Event listeners for connection status and message handling
        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // Print the QR code to the terminal
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('connection closed due to', lastDisconnect.error, ', reconnecting', shouldReconnect);
                // Reconnect if not logged out
                if (shouldReconnect) {
                    connectToWhatsApp();
                }
            } else if (connection === 'open') {
                console.log('opened connection');
            }
        });
    } catch (error) {
        console.error('Failed to initialize WhatsApp connection:', error);
        // Handle initialization error
    }
}

// Initialize WhatsApp connection
connectToWhatsApp();

// Basic route to verify server status
app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running');
});

// Endpoint to send a message
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'Number and message are required' });
    }

    if (!sock) {
        return res.status(500).json({ error: 'WhatsApp connection not initialized' });
    }

    try {
        await sock.sendMessage(`${number}@s.whatsapp.net`, { text: message });
        res.status(200).json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message', error: error.toString() });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
