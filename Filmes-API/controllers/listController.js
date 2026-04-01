const db = require('../db/db');

const listController = {
    criarLista: async (req, res) => {
        const { nome, descricao } = req.body;
        const loginId = req.usuario.id; 

        if (!nome || nome.trim() === '') {
            return res.status(400).json({ erro: "O nome da lista é obrigatório." });
        }

        try {
            const [userRows] = await db.execute('SELECT IDUSER FROM TBLUSER WHERE IDLOGIN = ?', [loginId]);
            
            if (userRows.length === 0) {
                return res.status(404).json({ erro: "Perfil de utilizador não encontrado." });
            }
            
            const idUserReal = userRows[0].IDUSER;

            const [rows] = await db.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM TBLLIST WHERE IDUSER = ? AND PADRAO = 0) +
                    (SELECT COUNT(*) FROM TBLLIST_FOLLOW WHERE IDUSER = ?) AS total_listas
            `, [idUserReal, idUserReal]);

            if (rows[0].total_listas >= 20) {
                return res.status(403).json({ erro: "Atingiu o limite máximo de 20 listas (criadas e seguidas)." });
            }

            const [resultado] = await db.execute(
                `INSERT INTO TBLLIST (IDUSER, NOMLIST, \`DESC\`, PADRAO) VALUES (?, ?, ?, 0)`,
                [idUserReal, nome, descricao || null]
            );

            return res.status(201).json({ 
                mensagem: "Lista criada com sucesso!",
                novaLista: {
                    id: resultado.insertId,
                    nome: nome,
                    descricao: descricao || "",
                    padrao: 0,
                    total_filmes: 0,
                    filmes: []
                }
            });

        } catch (error) {
            console.error("Erro ao criar lista:", error);
            return res.status(500).json({ erro: "Erro interno ao criar a lista." });
        }
    },

    adicionarFilme: async (req, res) => {
        const { listaId, filmeId } = req.body;
        const usuarioId = req.usuario.id;

        try {
            const [lista] = await db.query(`SELECT IDUSER FROM TBLLIST WHERE id = ?`, [listaId]);
            
            if (lista.length === 0) {
                return res.status(404).json({ erro: "Lista não encontrada." });
            }
            if (lista[0].IDUSER !== usuarioId) {
                return res.status(403).json({ erro: "Não tem permissão para editar esta lista." });
            }

            await db.query(
                `INSERT IGNORE INTO TBLLIST_FIL (IDLIST, IDFIL) VALUES (?, ?)`,
                [listaId, filmeId]
            );

            return res.status(200).json({ mensagem: "Filme adicionado à lista!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao adicionar filme à lista." });
        }
    },

    seguirLista: async (req, res) => {
        const { listaId } = req.body;
        const usuarioId = req.usuario.id;

        try {
            const [lista] = await db.query(`SELECT IDUSER FROM TBLLIST WHERE id = ?`, [listaId]);
            if (lista.length > 0 && lista[0].IDUSER === usuarioId) {
                return res.status(400).json({ erro: "Não pode seguir a sua própria lista." });
            }

            const [rows] = await db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM TBLLIST WHERE IDUSER = ? AND padrao = FALSE) +
                    (SELECT COUNT(*) FROM TBLLIST_FOLLOW WHERE IDUSER = ?) AS total_listas
            `, [usuarioId, usuarioId]);

            if (rows[0].total_listas >= 20) {
                return res.status(403).json({ erro: "Atingiu o limite máximo de 20 listas (criadas e seguidas)." });
            }

            await db.query(
                `INSERT IGNORE INTO TBLLIST_FOLLOW (IDLIST, IDUSER) VALUES (?, ?)`,
                [listaId, usuarioId]
            );

            return res.status(200).json({ mensagem: "Passou a seguir esta lista!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao seguir a lista." });
        }
    },

    curtirLista: async (req, res) => {
        const { listaId } = req.body;
        const usuarioId = req.usuario.id;

        try {
            await db.query(
                `INSERT IGNORE INTO TBLLIST_LIKE (IDLIST, IDUSER) VALUES (?, ?)`,
                [listaId, usuarioId]
            );

            return res.status(200).json({ mensagem: "Lista curtida!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao curtir a lista." });
        }
    }
};

module.exports = listController;