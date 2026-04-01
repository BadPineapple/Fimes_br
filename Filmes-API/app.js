require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const authRoutes    = require('./routes/loginRoutes');
const filmesRoutes  = require('./routes/filmesRoutes'); 
const opcoesRoutes  = require('./routes/opcoesRoutes'); 
const listRoutes    = require('./routes/listRoutes'); 
const imagensRoutes = require('./routes/imagensRoutes');
const perfilRoutes  = require('./routes/perfilRoutes');
const ragRoutes     = require('./routes/ragRoutes');
const pessoasRoutes = require('./routes/pessoaRoutes');

app.use(cors({
    origin: 'http://localhost:8080', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'] 
})); 
app.use(express.json());



app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
    res.json({ mensagem: '🎬 Bem-vindo à API de Filmes Pro!', status: 'Online' });
});

app.use('/auth', authRoutes);
app.use('/filmes',  filmesRoutes);
app.use('/opcoes',  opcoesRoutes); 
app.use('/listas',  listRoutes);  
app.use('/img',     imagensRoutes);
app.use('/perfil',  perfilRoutes);
app.use('/rag',     ragRoutes);
app.use('/artista', pessoasRoutes);

app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📌 Banco de Dados conectado via MySQL`);
});