const cluster = require('cluster');
const net = require('net');
const numCPUs = require('os').cpus().length;

const port = 3001;
const estatistica = {};
let clientesAtendidos = 0
const maxClientesAtendidos = 4

function a(){


// Função para calcular estatísticas de acertos e erros
function calcularEstatisticas(respostas) {
  const linhas = respostas.split('\n');
  const estatisticas = {};

  // Itera sobre cada linha de resposta
  for (const linha of linhas) {
    const [numeroQuestao, numeroAlternativas, resposta] = linha.split(';');
    const acertos = resposta.split('').filter((r) => r === 'V').length;
    const erros = resposta.split('').filter((r) => r === 'F').length;

    // Armazena as estatísticas da questão no objeto estatisticas
    estatisticas[numeroQuestao] = { acertos, erros };
  }

  return estatisticas;
}

// Função para criar o servidor TCP
function criarServidor() {
  // Criação do servidor TCP
  const server = net.createServer((socket) => {
    clientesAtendidos++;

    if (clientesAtendidos >= maxClientesAtendidos) {
      console.log(`Número máximo de clientes atendidos. Encerrando processo filho ${process.pid}`);
      process.exit();
    }
    console.log(`Novo cliente conectado: ${socket.remoteAddress}:${socket.remotePort}, PID: ${process.pid}`);

    socket.on('data', (data) => {
      const respostas = data.toString().trim();
      const resultado = calcularEstatisticas(respostas);
      console.log(resultado)

      // Atualiza as estatísticas gerais

      console.log(`Resultado enviado para o cliente: ${socket.remoteAddress}`);
      socket.write(JSON.stringify(resultado));
    });

    socket.on('close', () => {
      console.log(`Cliente desconectado: ${socket.remoteAddress}:${socket.remotePort}`);
      process.exit();
    });

    socket.on('error', (error) => {
      console.error(`Erro no cliente: ${error}`);
    });
  });

  // Inicia o servidor TCP
  server.listen(port, () => {
    console.log(`Servidor TCP escutando na porta: ${port}`);
  });
}

// Verifica se o processo atual é o processo mestre
if (cluster.isMaster) {
  console.log(`Processo mestre iniciado. Total de CPUs: ${numCPUs}`);

  // Cria os processos filhos
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Manipulador de eventos para os processos filhos
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Processo filho ${worker.process.pid} encerrado`);
    clientesAtendidos--;
    // Cria um novo processo filho se um processo morrer
    cluster.fork();
  });
} else {
  // Cada processo filho cria seu próprio servidor TCP
  criarServidor();
}

}

module.exports = a