const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { verificarAcesso } = require('../auth');

router.get('/:id', perfilController.obterPerfilCompleto);
router.put('/:id', perfilController.atualizarPerfil);

module.exports = router;