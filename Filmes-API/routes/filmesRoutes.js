const express = require('express');
const router = express.Router();
const filmeController = require('../controllers/filmeController.js');
const { somenteAdmin } = require('../auth');

router.get('/', filmeController.listarTodos);
router.get('/:id', filmeController.buscarPorId);

router.post('/', somenteAdmin, filmeController.criar);

router.put('/:id', filmeController.atualizar);

router.delete('/:id', somenteAdmin, filmeController.apagar);

module.exports = router;