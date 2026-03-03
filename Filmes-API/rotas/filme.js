const express = require('express');
const db = require('./db'); // Importa a conexão com o MySQL
const verificarAcesso = require('./auth');

const router = express.Router();

const formatarFilme = (dados) => {
    return {
        titulo:   String(dados.titulo).trim(), 
        diretor:  String(dados.diretor).trim(),
        elenco:   String(dados.elenco).trim(),
        roterista: String(dados.roterista).trim(),
        genero:   String(dados.genero).trim(),
        sinopse:  String(dados.sinopse).trim(), 
        tags:     String(dados.tags).trim(),
        imagens:  String(dados.imagens).trim(),
        duracao:  String(dados.duracao).trim(),
        ano:      Number(dados.ano)
    };
};

// Rota para buscar TODOS os filmes
router.get('/', async (req, res) => {
    try {
        const [filmes] = await db.execute('SELECT * FROM TBLFIL');
        res.json(filmes);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar filmes no banco de dados." });
    }
});

// Rota para ADICIONAR um filme (Apenas Admin)
router.post('/', verificarAcesso(['admin']), async (req, res) => {
    try {
        const novoFilme = formatarFilme(req.body);

        // O MySQL cuida do ID automaticamente, então apenas inserimos os dados
        const [result] = await db.execute('INSERT INTO TBLFIL SET ?', [novoFilme]);

        res.status(201).json({ id: result.insertId, ...novoFilme }); 
    } catch (error) {
        res.status(400).json({ erro: "Erro ao inserir filme: " + error.message });
    }
});

// Rota para buscar um filme específico pelo ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [filmes] = await db.execute('SELECT * FROM TBLFIL WHERE id = ?', [id]);

        if (filmes.length === 0) {
            return res.status(404).json({ mensagem: "Filme não encontrado" });
        }

        res.json(filmes[0]);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar o filme." });
    }
});

// Rota para ATUALIZAR um filme
router.put('/:id', verificarAcesso(['admin']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dadosAtualizados = formatarFilme(req.body);

        const [result] = await db.execute('UPDATE TBLFIL SET ? WHERE id = ?', [dadosAtualizados, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Filme não encontrado para atualização." });
        }

        res.json({ mensagem: "Filme atualizado com sucesso!", id, ...dadosAtualizados });
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

// Rota para DELETAR um filme
router.delete('/:id', verificarAcesso(['admin']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const [result] = await db.execute('DELETE FROM TBLFIL WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Filme não encontrado para exclusão." });
        }

        res.json({ mensagem: `Filme com ID ${id} removido com sucesso!` });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar filme." });
    }
});

module.exports = router;