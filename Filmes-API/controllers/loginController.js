const db = require('../db/db'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_muito_longa_e_segura';

const loginController = {
    listarUsuarios: async (req, res) => {
         try {
        const [usuarios] = await db.execute(`
            SELECT l.IDLOGIN, p.NOMUSER, l.email, l.TEL, p.DTANASC, p.APOIA, p.lead, GROUP_CONCAT(r.NOMROL) as roles
            FROM TBLLOGIN l
            LEFT JOIN TBLUSER p ON l.IDLOGIN = p.IDLOGIN
            LEFT JOIN TBLLOG_ROL lr ON l.IDLOGIN = lr.IDLOGIN
            LEFT JOIN TBLROL r ON lr.IDROl = r.IDROL
            GROUP BY l.IDLOGIN, p.IDUSER
        `);
        res.json(usuarios);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar utilizadores: " + error.message });
        }
    },
    
    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!req.usuario.roles.includes('admin') && req.usuario.id !== parseInt(id)) {
                return res.status(403).json({ erro: "Acesso negado. Apenas pode ver o seu próprio perfil." });
            }

            const [rows] = await db.execute(`
                SELECT l.IDLOGIN, p.nome, l.email, l.telefone, l.status, p.data_nascimento, p.descricao, p.apoiador, p.lead, p.foto_perfil, GROUP_CONCAT(r.nome_role) as roles
                FROM TBLLOGIN l
                LEFT JOIN TBLUSER p ON l.IDLOGIN = p.IDLOGIN
                LEFT JOIN TBLLOG_ROL lr ON l.IDLOGIN = lr.IDLOGIN
                LEFT JOIN TBLROL r ON lr.IDROL = r.IDROL
                WHERE l.IDLOGIN = ?
                GROUP BY l.IDLOGIN, p.IDUSER
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ mensagem: "Conta não encontrada." });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Erro ao buscar os dados da conta." });
        }
    },

    registrar: async (req, res) => {
        try {
            const { nome, email, senha, telefone, propaganda } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: "Campos obrigatórios: nome, email e senha." });
            }

            const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!regexSenha.test(senha)) {
                return res.status(400).json({ 
                    erro: "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, um número e um caractere especial." 
                });
            }

            let queryCheck = 'SELECT IDLOGIN, STATS FROM TBLLOGIN WHERE email = ?';
            let paramsCheck = [email];
            
            if (telefone) {
                queryCheck += ' OR TEL = ?';
                paramsCheck.push(telefone);
            }

            const [contaExistente] = await db.execute(queryCheck, paramsCheck);

            const senhaHash = await bcrypt.hash(senha, 10); 
            const tokenVerificacao = Math.floor(100000 + Math.random() * 900000).toString();
            
            let loginId;

            if (contaExistente.length > 0) {
                const conta = contaExistente[0];

                if (conta.STATS === 'A') {
                    return res.status(400).json({ erro: "E-mail ou telefone já está em uso." });
                }
                if (conta.STATS === 'B') {
                    return res.status(403).json({ erro: "Esta conta encontra-se banida do sistema." });
                }
                if (conta.STATS === 'D') {
                    loginId = conta.IDLOGIN;
                    await db.execute(
                        'UPDATE TBLLOGIN SET senha = ?, TEL = ?, token_verificacao = ?, EMAILVAL = FALSE, STATS = "A" WHERE IDLOGIN = ?',
                        [senhaHash, telefone || null, tokenVerificacao, loginId]
                    );
                }
            } else {
                const [loginResult] = await db.execute(
                    'INSERT INTO TBLLOGIN (email, senha, TEL, DTACRI, token_verificacao, EMAILVAL, STATS) VALUES (?, ?, ?, CURDATE(), ?, FALSE, "A")',
                    [email, senhaHash, telefone || null, tokenVerificacao]
                );
                loginId = loginResult.insertId;
            }

            await db.execute(
                `INSERT INTO TBLUSER (IDLOGIN, NOMUSER, lead) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE NOMUSER = VALUES(NOMUSER), lead = VALUES(lead)`,
                [loginId, nome, propaganda ? 1 : 0]
            );

            await db.execute('INSERT IGNORE INTO TBLLOG_ROL (IDLOGIN, IDROL) VALUES (?, ?)', [loginId, 2]);

            const [userRows] = await db.execute('SELECT IDUSER FROM TBLUSER WHERE IDLOGIN = ?', [loginId]);
            
            if (userRows.length > 0) {
                const idUserReal = userRows[0].IDUSER;

                const [listasExistentes] = await db.execute('SELECT IDLIST FROM tbllist WHERE IDUSER = ?', [idUserReal]);

                if (listasExistentes.length === 0) {
                    await db.execute(`
                        INSERT INTO tbllist (IDUSER, NOMLIST, DESC, PADRAO) VALUES 
                        (?, 'Favoritos', 'Os meus filmes favoritos', 1),
                        (?, 'Like', 'Filmes que eu gostei', 1),
                        (?, 'Watchlist', 'Filmes para ver mais tarde', 1)
                    `, [idUserReal, idUserReal, idUserReal]);
                }
            }

            console.log(`Código de verificação para ${email}: ${tokenVerificacao}`);
            res.status(201).json({ mensagem: "Conta processada com sucesso! Verifique o seu e-mail com o código enviado." });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Erro ao registar utilizador." });
        }
    },

    verificarEmail: async (req, res) => {
        try {
            const { email, codigo } = req.body;

            const [rows] = await db.execute('SELECT IDLOGIN, token_verificacao, STATS FROM TBLLOGIN WHERE email = ?', [email]);

            if (rows.length === 0) {
                return res.status(404).json({ erro: "Conta não encontrada." });
            }

            const user = rows[0];

            if (user.STATS === 'B') {
                return res.status(403).json({ erro: "Operação não permitida: Esta conta encontra-se banida." });
            }

            if (user.token_verificacao !== codigo) {
                return res.status(400).json({ erro: "Código de verificação inválido." });
            }

            await db.execute('UPDATE TBLLOGIN SET EMAILVAL = TRUE, token_verificacao = NULL WHERE IDLOGIN = ?', [user.IDLOGIN]);

            res.json({ mensagem: "E-mail verificado com sucesso! Já pode iniciar sessão." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Erro ao verificar o e-mail." });
        }
    },

    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            const [rows] = await db.execute(`
                SELECT l.*, p.NOMUSER, r.NOMROL 
                FROM TBLLOGIN l
                LEFT JOIN TBLUSER p ON l.IDLOGIN = p.IDLOGIN
                LEFT JOIN TBLLOG_ROL lr ON l.IDLOGIN = lr.IDLOGIN 
                LEFT JOIN TBLROL r ON lr.IDROL = r.IDROL
                WHERE l.email = ? AND l.auth_provider = 'local'`, [email]);

            if (rows.length === 0) {
                return res.status(404).json({ 
                    erro: "Conta não encontrada. Redirecionando para o registo...", 
                    acao: "registrar" 
                });
            }

            const user = rows[0];

            if (user.STATS === 'B') {
                return res.status(403).json({ erro: "Acesso negado: Esta conta encontra-se banida do sistema." });
            }

            if (user.STATS === 'D') {
                return res.status(403).json({ 
                    erro: "Conta desativada. Redirecionando para reativar o registo...", 
                    acao: "registrar" 
                });
            }

            if (!user.EMAILVAL) {
                return res.status(403).json({ 
                    erro: "E-mail não verificado.", 
                    precisaVerificar: true 
                });
            }

            const senhaValida = await bcrypt.compare(senha, user.PASS);

            if (!senhaValida) {
                return res.status(401).json({ erro: "E-mail ou senha incorretos." });
            }

            const roles = rows.map(r => r.NOMROL).filter(role => role !== null);

            await db.execute('UPDATE TBLLOGIN SET ULTACES = NOW() WHERE IDLOGIN = ?', [user.IDLOGIN]);

            const token = jwt.sign(
                { id: user.IDLOGIN, nome: user.NOMUSER, roles: roles }, 
                JWT_SECRET, 
                { expiresIn: '12h' }
            );

            res.json({
                mensagem: "Login realizado com sucesso!",
                token: token,
                usuario: { id: user.IDLOGIN, nome: user.NOMUSER, roles: roles }
            });

        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ erro: "Erro interno no servidor." });
        }
    },

    loginGoogle: async (req, res) => {
        try {
            const { token } = req.body; 

            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        
            const payload = ticket.getPayload();
            const email = payload['email'];
            const nome = payload['name'];
            const provider_id = payload['sub'];
            const foto_url = payload['picture'];

            const [rows] = await db.execute(`
                SELECT l.*, p.nome as nome_perfil, r.nome_role 
                FROM TBLLOGIN l
                LEFT JOIN TBLUSER p ON l.IDLOGIN = p.IDLOGIN
                LEFT JOIN TBLLOG_ROL lr ON l.IDLOGIN = lr.IDUSER
                LEFT JOIN TBLROL r ON lr.IDROL = r.IDROL
                WHERE l.email = ?`, [email]);

            if (rows.length === 0) {
                return res.status(404).json({ 
                    erro: "Conta não encontrada. Redirecionando para o registo...", 
                    acao: "registrar",
                    dadosPreenchimento: { nome, email } 
                });
            }

            const user = rows[0];
            const roles = rows.map(r => r.nome_role).filter(role => role !== null);

            if (user.status === 'B') {
                return res.status(403).json({ erro: "Acesso negado: Esta conta encontra-se banida do sistema." });
            }

            if (user.status === 'D') {
                return res.status(403).json({ 
                    erro: "Conta desativada. Redirecionando para reativar o registo...", 
                    acao: "registrar",
                    dadosPreenchimento: { nome, email }
                });
            }

            if (user.auth_provider === 'local') {
                await db.execute('UPDATE TBLLOGIN SET auth_provider = ?, provider_id = ?, EMAILVAL = TRUE WHERE IDLOGIN = ?', 
                ['google', provider_id, user.id]);
            }

            await db.execute('UPDATE TBLLOGIN SET ultaces = NOW() WHERE idlogin = ?', [user.id]);

            const nossoToken = jwt.sign(
                { id: user.id, nome: user.nome_perfil || nome, roles: roles }, 
                JWT_SECRET, 
                { expiresIn: '12h' }
            );

            res.json({
                mensagem: "Login com Google verificado e realizado com sucesso!",
                token: nossoToken,
                usuario: { id: user.id, nome: user.nome_perfil || nome, roles: roles, foto: foto_url }
            });

        } catch (error) {
            console.error("Erro na verificação do token Google:", error);
            res.status(401).json({ erro: "Token do Google inválido ou expirado." });
        }
    },


    atualizarLogin: async (req, res) => {
        try {
            const { id } = req.params;
            const { email, telefone } = req.body;

            if (!req.usuario.roles.includes('admin') && req.usuario.id !== parseInt(id)) {
                return res.status(403).json({ erro: "Não tem permissão para editar este login." });
            }

            const [resultLogin] = await db.execute(
                'UPDATE TBLLOGIN SET email = ?, tel = ? WHERE idlogin = ?',
                [email, telefone, id]
            );

            if (resultLogin.affectedRows === 0) {
                return res.status(404).json({ erro: "Conta não encontrada." });
            }

            res.json({ mensagem: "Credenciais de acesso atualizadas com sucesso!" });
        } catch (error) {
            res.status(400).json({ erro: "Erro ao atualizar credenciais: " + error.message });
        }
    },

    atualizarUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;

            if (!req.usuario.roles.includes('admin') && req.usuario.id !== parseInt(id)) {
                return res.status(403).json({ erro: "Não tem permissão para editar este perfil." });
            }

            const [resultUser] = await db.execute(
                'UPDATE TBLUSER SET NOMUSER = ?, DESCUSER = ? WHERE IDLOGIN = ?',
                [nome, descricao || null, id]
            );

            if (resultUser.affectedRows === 0) {
                return res.status(404).json({ erro: "Perfil de utilizador não encontrado." });
            }

            res.json({ mensagem: "Perfil público atualizado com sucesso!" });
        } catch (error) {
            res.status(400).json({ erro: "Erro ao atualizar perfil: " + error.message });
        }
    },

    apagar: async (req, res) => {
       try {
        const { id } = req.params;

        const [result] = await db.execute('DELETE FROM TBLLOGIN WHERE IDLOGIN = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Utilizador não encontrado." });
        }

        res.json({ mensagem: `Utilizador com ID ${id} removido com sucesso!` });
        } catch (error) {
         res.status(500).json({ erro: "Erro ao apagar utilizador." });
        }
    },

    desativar: async (req, res) => {
        try {
            const { id } = req.params;

            const [result] = await db.execute('UPDATE TBLLOGIN SET STATS = "D" WHERE IDLOGIN = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: "Conta não encontrada." });
            }

            res.json({ mensagem: `Conta com ID ${id} desativada com sucesso!` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Erro ao desativar a conta." });
        }
    }
};

module.exports = loginController;