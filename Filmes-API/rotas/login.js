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
        const [usuarios] = await db.query(`
            SELECT u.id, u.usuario, u.email, u.telefone, GROUP_CONCAT(r.nome_role) as roles
            FROM usuarios u
            LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuario
            LEFT JOIN roles r ON ur.id_role = r.id
            GROUP BY u.id
        `);
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar usuários: " + error.message });
    }
});

// GET: Buscar um usuário específico por ID
router.get('/:id', verificarAcesso(['admin', 'user']), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verifica se o usuário logado está tentando ver o seu próprio perfil ou se é admin
        if (req.usuario.roles.indexOf('admin') === -1 && req.usuario.id !== parseInt(id)) {
            return res.status(403).json({ erro: "Acesso negado. Você só pode ver seu próprio perfil." });
        }

        const [rows] = await db.query(`
            SELECT u.id, u.usuario, u.email, u.telefone, GROUP_CONCAT(r.nome_role) as roles
            FROM usuarios u
            LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuario
            LEFT JOIN roles r ON ur.id_role = r.id
            WHERE u.id = ?
            GROUP BY u.id
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar usuário." });
    }
});

// --- ROTA DE REGISTRO (SIGNUP) ---
router.post('/registrar', async (req, res) => {
    try {
        const { usuario, email, senha, telefone } = req.body;

        // 1. Verificação básica
        if (!usuario || !email || !senha) {
            return res.status(400).json({ erro: "Campos obrigatórios: usuario, email e senha." });
        }

        // 2. CRIPTOGRAFIA: Nunca salvamos a senha pura
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        // 3. Inserir na tabela de usuários
        // Usamos transação ou inserção simples
        const [userResult] = await db.query(
            'INSERT INTO usuarios (usuario, email, senha, telefone) VALUES (?, ?, ?, ?)',
            [usuario, email, senhaHash, telefone]
        );

        const userId = userResult.insertId;

        // 4. Atribuir Role padrão (ex: ID 2 para 'user')
        // No seu diagrama, isso alimenta a tabela 'usuarios_roles'
        await db.query('INSERT INTO usuarios_roles (id_usuario, id_role) VALUES (?, ?)', [userId, 2]);

        res.status(201).json({ mensagem: "Usuário criado com sucesso!" });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: "Usuário ou Email já cadastrado." });
        }
        res.status(500).json({ erro: "Erro ao registrar usuário." });
    }
});

// --- ROTA DE LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Buscar o usuário e suas ROLES em uma única consulta (JOIN)
        const [rows] = await db.query(`
            SELECT u.*, r.nome_role 
            FROM usuarios u
            LEFT JOIN usuarios_roles ur ON u.id = ur.id_usuario
            LEFT JOIN roles r ON ur.id_role = r.id
            WHERE u.email = ?`, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        const user = rows[0];

        // 2. Extrair todas as roles do usuário (caso ele tenha mais de uma)
        const roles = rows.map(r => r.nome_role).filter(role => role !== null);

        // 3. COMPARAR A SENHA: O Bcrypt compara a senha digitada com o Hash do banco
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }

        // 4. GERAR TOKEN JWT: Contém as permissões do usuário
        const token = jwt.sign(
            { 
                id: user.id, 
                usuario: user.usuario, 
                roles: roles // O middleware 'verificarAcesso' usará isso
            }, 
            JWT_SECRET, 
            { expiresIn: '12h' } // Token expira em 12 horas
        );

        res.json({
            mensagem: "Login realizado com sucesso!",
            token: token,
            usuario: {
                id: user.id,
                nome: user.usuario,
                roles: roles
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

router.put('/:id', verificarAcesso(['admin', 'user']), async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario, email, telefone } = req.body;

        // Segurança: Apenas o dono da conta ou admin pode editar
        if (req.usuario.roles.indexOf('admin') === -1 && req.usuario.id !== parseInt(id)) {
            return res.status(403).json({ erro: "Você não tem permissão para editar este usuário." });
        }

        const [result] = await db.query(
            'UPDATE usuarios SET usuario = ?, email = ?, telefone = ? WHERE id = ?',
            [usuario, email, telefone, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        res.json({ mensagem: "Dados atualizados com sucesso!" });
    } catch (error) {
        res.status(400).json({ erro: "Erro ao atualizar: " + error.message });
    }
});

router.delete('/:id', verificarAcesso(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        res.json({ mensagem: `Usuário com ID ${id} removido com sucesso!` });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar usuário." });
    }
});

module.exports = router;