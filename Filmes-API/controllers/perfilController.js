const db = require('../db/db');

const perfilController = {
    obterPerfilCompleto: async (req, res) => {
        try {
            const loginId = parseInt(req.params.id);

            const [usuario] = await db.execute(`
                SELECT 
                    p.IDUSER as id_perfil, 
                    p.NOMUSER as nome, 
                    p.DESC as descricao,
                    i.LOCAL as foto_perfil, -- Traz a URL da imagem do repositório
                    p.DTANASC as data_nascimento, 
                    l.EMAIL as email, 
                    l.STATS as status
                FROM tbluser p
                INNER JOIN tbllogin l ON p.IDLOGIN = l.IDLOGIN
                LEFT JOIN TBLIMG i ON p.FOTPER = i.IDIMG -- LIGAÇÃO COM A TABELA DE IMAGENS
                WHERE l.IDLOGIN = ?
            `, [loginId]);

            if (usuario.length === 0) {
                return res.status(404).json({ erro: "Utilizador não encontrado." });
            }

            const dadosPerfil = usuario[0];
            const idUsuarioReal = dadosPerfil.id_perfil;

            const [listas] = await db.execute(`
                SELECT 
                    l.IDLIST as id, 
                    l.NOMLIST as nome, 
                    l.DESC as descricao,
                    l.PADRAO as padrao, 
                    l.DTACRI as data_criacao
                FROM tbllist l
                WHERE IDUSER = ?
            `, [idUsuarioReal]);

            for (let lista of listas) {
                const [filmes] = await db.execute(`
                    SELECT 
                        f.IDFIL as id, 
                        f.NOMFIL as titulo, 
                        img.LOCAL as imagem, 
                        f.ANO as ano,
                        fl.DTAADC as data_adicao
                    FROM tbllist_fil fl
                    INNER JOIN tblfil f ON fl.IDFIL = f.IDFIL
                    LEFT JOIN TBLIMG img ON f.IMG = img.IDIMG
                    WHERE fl.IDLIST = ?
                    ORDER BY fl.DTAADC DESC
                `, [lista.id]);
                
                lista.filmes = filmes;
                lista.total_filmes = filmes.length;
            }

            delete dadosPerfil.id_perfil;

            res.json({
                perfil: dadosPerfil,
                listas: listas
            });

        } catch (error) {
            console.error("Erro ao buscar perfil completo:", error);
            res.status(500).json({ erro: "Erro interno ao carregar o perfil." });
        }
    },

    atualizarPerfil: async (req, res) => {
        try {
            const loginId = parseInt(req.params.id);
            const { nome, descricao, foto_perfil } = req.body; 
            if (!nome || nome.trim() === '') {
                return res.status(400).json({ erro: "O nome não pode estar vazio." });
            }

            if (foto_perfil) {
                const [result] = await db.execute(`
                    UPDATE tbluser 
                    SET NOMUSER = ?, DESC = ?, FOTPER = ? 
                    WHERE IDLOGIN = ?
                `, [nome, descricao, foto_perfil, loginId]);
            } else {
                const [result] = await db.execute(`
                    UPDATE tbluser 
                    SET NOMUSER = ?, DESC = ? 
                    WHERE IDLOGIN = ?
                `, [nome, descricao, loginId]);
            }

            res.json({ mensagem: "Perfil atualizado com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            res.status(500).json({ erro: "Erro ao atualizar perfil." });
        }
    }
};

module.exports = perfilController;