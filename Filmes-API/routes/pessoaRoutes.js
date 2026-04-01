const express = require('express');
const router = express.Router();
const pessoasController = require('../controllers/pessoasController');

router.get('/', pessoasController.listar);

router.get('/:id', pessoasController.buscarPorId);

router.post('/', pessoasController.criar);

router.put('/:id', pessoasController.atualizar);

router.delete('/:id', pessoasController.apagar);

module.exports = router;