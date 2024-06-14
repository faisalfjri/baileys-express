# Baileys and Express

Hi, this is the implementation example of <a href="https://github.com/WhiskeySockets/Baileys">WhiskeySockets/Baileys</a>

### How to use?

- Clone or download this repo
- Enter to the project directory
- Run `npm install`
- Run `npm start`
- Open browser and go to address `http://localhost:3000`
- Scan the QR Code
- Enjoy!

### Send message

Send a Message via HTTP: You can now send WhatsApp messages by making a POST request to http://localhost:3000/send-message with a JSON body containing the number and message fields.

For example, using curl:
```bash
curl -X POST http://localhost:3000/send-message -H "Content-Type: application/json" -d '{"number": "1234567890", "message": "Hello from Baileys and Express!"}'
```