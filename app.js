const { Client } = require('whatsapp-web.js');
const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIO(server);

const client = new Client();

client.on('qr', (qr) => {
    io.emit('qr-code', qr);
});

client.on('ready', () => {
    io.emit('ready');
    console.log('WhatsApp client is ready!');
});

client.on('message', async (message) => {
    const chat = await message.getChat();
    const phoneNumber = chat.id.user;
    const name = chat.name || phoneNumber;
    const status = message.hasMedia || message.hasQuotedMsg ? 'delivered' : 'failed';
    io.emit('message', { name, phoneNumber, status });
});

app.use(express.static('public'));

app.post('/send', multer().single('file'), async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.getWorksheet(1);
        const rows = worksheet.getRows();

        for (let row of rows) {
            const phoneNumber = row.getCell(1).value.toString();
            const message = row.getCell(2).value.toString();
            const name = row.getCell(3).value.toString();

            const chat = await client.getChatById(`${phoneNumber}@c.us`);
            await chat.sendMessage(message);
            console.log(`Message sent to ${name} (${phoneNumber})`);
        }

        res.status(200).send('Messages sent successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while sending messages!');
    }
});

client.initialize();

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});