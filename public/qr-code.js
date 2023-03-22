
const qrCode = new QRCode(document.getElementById('qr-code'), {
    text: '',
    width: 300,
    height: 300,
    colorDark: '#000000',
    colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.H
  });
  
  const message = document.getElementById('message');
  
  const socket = io();
  socket.on('qr-code', (qr) => {
    qrCode.clear();
    qrCode.makeCode(qr);
    message.textContent = 'Scan this QR code with your phone';
  });
  
  socket.on('ready', () => {
    message.textContent = 'WhatsApp client is ready!';
  });
  
  socket.on('message', (data) => {
    const { name, phoneNumber, status } = data;
    const line = `${name} (${phoneNumber}): ${status}`;
    message.textContent = line;
  });
  