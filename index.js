const { Client } = require('whatsapp-web.js');
const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000;

const client = new Client();

client.on('qr', (qr) => {
  console.log('Scan this QR code with your phone: ', qr);
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
