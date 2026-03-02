// 1. Configuração de Variáveis de Ambiente (Sempre no topo)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// 2. Importação das Rotas
const authRoutes       = require('./rotas/login'); // Login e Registro
const filmeRoutes      = require('./rotas/filme');
const generoRoutes     = require('./rotas/genero');
const plataformaRoutes = require('./rotas/plataforma');
const tagRoutes        = require('./rotas/tag');
const pessoaRoutes     = require('./rotas/pessoa');
const imagensRoutes    = require('./rotas/imagens');

// 3. Middlewares Globais
app.use(cors()); // Permite que o seu site (frontend) acesse a API
app.use(express.json()); // Permite que a API receba dados em formato JSON

// 4. Definição das Rotas (Endpoints)

// Se alguém aceder a http://localhost:3000/uploads/img_123.webp, vai ver a imagem
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de Boas-vindas
app.get('/', (req, res) => {
    res.json({ mensagem: '🎬 Bem-vindo à API de Filmes Pro!', status: 'Online' });
});

// Rotas de Autenticação (Pública)
app.use('/auth', authRoutes);

// Rotas de Conteúdo (Protegidas ou Públicas dependendo do método)
app.use('/tags',        tagRoutes);
app.use('/pessoas',     pessoaRoutes);
app.use('/filmes',      filmeRoutes);
app.use('/generos',     generoRoutes);
app.use('/plataformas', plataformaRoutes);
app.use('/imagens',     imagensRoutes);


// 5. Tratamento de Erro 404 (Rota não encontrada)
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

// 6. Iniciando o servidor usando a porta do .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📌 Banco de Dados conectado via MySQL`);
});