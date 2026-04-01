const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { autenticado } = require('../auth'); 

router.post('/criar', autenticado, listController.criarLista);

router.post('/adicionar-filme', autenticado, listController.adicionarFilme);

router.post('/seguir', autenticado, listController.seguirLista);

router.post('/curtir', autenticado, listController.curtirLista);

module.exports = router;