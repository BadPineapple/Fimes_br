const express = require('express');
const router = express.Router();
const opcoesController = require('../controllers/opcoesController');

// Não requerem autenticação estrita para leitura, pois o formulário precisa carregar as opções
router.get('/generos', opcoesController.listarGeneros);
router.get('/tags', opcoesController.listarTags);
router.get('/plataformas', opcoesController.listarPlataformas);
router.get('/pessoas', opcoesController.listarPessoas);

router.post('/generos', somenteAdmin, opcoesController.criarGenero);
router.post('/tags', somenteAdmin, opcoesController.criarTag);
router.post('/plataformas', somenteAdmin, opcoesController.criarPlataforma);
router.post('/pessoas', somenteAdmin, opcoesController.criarPessoa);

router.get('/generos/:id', opcoesController.buscarGeneroPorId);
router.get('/tags/:id', opcoesController.buscarTagPorId);
router.get('/plataformas/:id', opcoesController.buscarPlataformaPorId);
router.get('/pessoas/:id', opcoesController.buscarPessoaPorId);

router.put('/generos/:id', somenteAdmin, opcoesController.atualizarGenero);
router.put('/tags/:id', somenteAdmin, opcoesController.atualizarTag);
router.put('/plataformas/:id', somenteAdmin, opcoesController.atualizarPlataforma);
router.put('/pessoas/:id', somenteAdmin, opcoesController.atualizarPessoa);

router.delete('/generos/:id', somenteAdmin, opcoesController.apagarGenero);
router.delete('/tags/:id', somenteAdmin, opcoesController.apagarTag);
router.delete('/plataformas/:id', somenteAdmin, opcoesController.apagarPlataforma);
router.delete('/pessoas/:id', somenteAdmin, opcoesController.apagarPessoa);

module.exports = router;