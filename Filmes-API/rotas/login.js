const express = require('express');
const db = require('./db'); // Sua conexão pool do MySQL
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configurações de segurança
const SALT_ROUNDS = 10; // Custo da criptografia (quanto maior, mais seguro e lento)
const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_muito_longa_e_segura';

router.get('/', verificarAcesso(['admin']), async (req, res) => {
    try {
        const [usuarios] = await db.execute(`
            SELECT l.id, p.nome, l.email, l.telefone, p.data_nascimento, p.apoiador, p.aceita_propaganda, GROUP_CONCAT(r.nome_role) as roles
            FROM TBLLOGIN l
            LEFT JOIN TBLUSER p ON l.id = p.login_id
            LEFT JOIN TBLLOGROL lr ON l.id = lr.usuario
            LEFT JOIN TBLROL r ON lr.role = r.id
            GROUP BY l.id, p.id
        `);
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar utilizadores: " + error.message });
    }
});

// GET: Buscar um usuário específico por ID
router.get('/:id', verificarAcesso(['admin', 'user']), async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.usuario.roles.indexOf('admin') === -1 && req.usuario.id !== parseInt(id)) {
            return res.status(403).json({ erro: "Acesso negado. Apenas pode ver o seu próprio perfil." });
        }

        const [rows] = await db.execute(`
            SELECT l.id, p.nome, l.email, l.telefone, p.data_nascimento, p.descricao, p.apoiador, p.aceita_propaganda, GROUP_CONCAT(r.nome_role) as roles
            FROM TBLLOGIN l
            LEFT JOIN TBLUSER p ON l.id = p.login_id
            LEFT JOIN TBLLOGROL lr ON l.id = lr.usuario
            LEFT JOIN TBLROL r ON lr.role = r.id
            WHERE l.id = ?
            GROUP BY l.id, p.id
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: "Utilizador não encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar utilizador." });
    }
});

// --- ROTA DE REGISTRO (SIGNUP) ---
router.post('/registrar', async (req, res) => {
    try {
        const { nome, email, senha, data_nascimento, telefone, propaganda } = req.body;

        if (!nome || !email || !senha || !data_nascimento) {
            return res.status(400).json({ erro: "Campos obrigatórios: nome, email, senha e data de nascimento." });
        }

        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        // 1. Inserir na tabela de Login
        const [loginResult] = await db.execute(
            'INSERT INTO TBLLOGIN (email, senha, telefone, data) VALUES (?, ?, ?, CURDATE())',
            [email, senhaHash, telefone || null]
        );

        const loginId = loginResult.insertId;

        // 2. Inserir na tabela de Utilizador (Perfil)
        await db.execute(
            'INSERT INTO TBLUSER (login_id, nome, data_nascimento, aceita_propaganda) VALUES (?, ?, ?, ?)',
            [loginId, nome, data_nascimento, propaganda ? 1 : 0]
        );

        // 3. Atribuir Role padrão (ex: ID 2 para 'user')
        await db.execute('INSERT INTO TBLLOGROL (usuario, role) VALUES (?, ?)', [loginId, 2]);

        res.status(201).json({ mensagem: "Utilizador criado com sucesso!" });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: "Email já cadastrado." });
        }
        res.status(500).json({ erro: "Erro ao registar utilizador." });
    }
});

// --- ROTA DE LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [rows] = await db.execute(`
            SELECT l.*, p.nome, r.nome_role 
            FROM TBLLOGIN l
            LEFT JOIN TBLUSER p ON l.id = p.login_id
            LEFT JOIN TBLLOGROL lr ON l.id = lr.usuario
            LEFT JOIN TBLROL r ON lr.role = r.id
            WHERE l.email = ?`, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        const user = rows[0];
        const roles = rows.map(r => r.nome_role).filter(role => role !== null);
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        // Atualiza a data do último acesso
        await db.execute('UPDATE TBLLOGIN SET ultimo_acesso = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign(
            { id: user.id, nome: user.nome, roles: roles }, 
            JWT_SECRET, 
            { expiresIn: '12h' }
        );

        res.json({
            mensagem: "Login realizado com sucesso!",
            token: token,
            usuario: { id: user.id, nome: user.nome, roles: roles }
        });

    } catch (error) {
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

router.put('/:id', verificarAcesso(['admin', 'user']), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, descricao } = req.body;

        if (req.usuario.roles.indexOf('admin') === -1 && req.usuario.id !== parseInt(id)) {
            return res.status(403).json({ erro: "Não tem permissão para editar este utilizador." });
        }

        // Atualiza a tabela de Login
        const [resultLogin] = await db.execute(
            'UPDATE TBLLOGIN SET email = ?, telefone = ? WHERE id = ?',
            [email, telefone, id]
        );

        // Atualiza a tabela de Perfil do utilizador
        const [resultUser] = await db.execute(
            'UPDATE TBLUSER SET nome = ?, descricao = ? WHERE login_id = ?',
            [nome, descricao || null, id]
        );

        if (resultLogin.affectedRows === 0 && resultUser.affectedRows === 0) {
            return res.status(404).json({ erro: "Utilizador não encontrado." });
        }

        res.json({ mensagem: "Dados atualizados com sucesso!" });
    } catch (error) {
        res.status(400).json({ erro: "Erro ao atualizar: " + error.message });
    }
});

router.delete('/:id', verificarAcesso(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        // Como configurou a chave estrangeira com ON DELETE CASCADE na criação da TBLUSER e TBLLOGROL,
        // apagar na TBLLOGIN removerá automaticamente os registos dependentes nas outras tabelas.
        const [result] = await db.execute('DELETE FROM TBLLOGIN WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Utilizador não encontrado." });
        }

        res.json({ mensagem: `Utilizador com ID ${id} removido com sucesso!` });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao apagar utilizador." });
    }
});

module.exports = router;