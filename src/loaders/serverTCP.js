const net = require('net');

const server = net.createServer();

const port = 3001;

function startServerTCP(){
  server.on('listening', () => {
    const address = server.address();
    console.log(`Servidor escutando na porta: ${address.port}`);
  });
  
  server.on('connection', (socket) => {
    console.log(`Novo cliente conectado: ${socket.remoteAddress}:${socket.remotePort}`);
  
    socket.on('data', (data) => {
      const message = data.toString()
      const [numeroQuestoes, Alternatives, respostas] = message.split(';');
  
      const correctAnswers = 'VVFFV';
  
      const corretas = respostas.split('').filter((response, index) => {
        return response === correctAnswers[index];
      }).length;
  
      const incorretas = respostas.length - corretas;
  
      const response = `${numeroQuestoes};${corretas};${incorretas}`;
  
      socket.write(response);
    });
  
    socket.on('close', () => {
      console.log(`Cliente desconectado`);
    });
  
    socket.on('error', (error) => {
      console.error(`Erro no cliente `);
    });
  });
  
  server.listen(port);


}

module.exports = startServerTCP
