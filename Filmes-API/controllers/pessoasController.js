const db = require('../db/db');

const pessoasController = {
    listar: async (req, res) => {
        try {
            const query = `
                SELECT 
                    p.IDPES, p.NOMPES, p.CARGO, p.DTANASC, p.DTAFAL, p.NATU, p.BIO,
                    f.NOMFIL, f.ANO, fp.PPL
                FROM TBLPES p
                LEFT JOIN TBLFIL_PES fp ON p.IDPES = fp.IDPES
                LEFT JOIN TBLFIL f ON fp.IDFIL = f.IDFIL
                ORDER BY p.NOMPES ASC, f.ANO DESC
            `;
            
            const [linhas] = await db.execute(query);

            const pessoasMap = new Map();

            linhas.forEach(row => {
                if (!pessoasMap.has(row.IDPES)) {
                    pessoasMap.set(row.IDPES, {
                        id: row.IDPES.toString(), 
                        nome: row.NOMPES,
                        tipo: row.CARGO,
                        nascimento: row.DTANASC,
                        falecimento: row.DTAFAL,
                        naturalidade: row.NATU,
                        biografia: row.BIO,
                        filmografia: []
                    });
                }

                if (row.NOMFIL) {
                    pessoasMap.get(row.IDPES).filmografia.push({
                        titulo: row.NOMFIL,
                        papel: row.PPL,
                        ano: row.ANO
                    });
                }
            });

            const resultado = Array.from(pessoasMap.values());

            res.json(resultado);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar pessoas.", detalhe: error.message });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            
            const query = `
                SELECT 
                    p.IDPES, p.NOMPES, p.CARGO, p.DTANASC, p.DTAFAL, p.NATU, p.BIO,
                    f.NOMFIL, f.ANO, fp.PPL
                FROM TBLPES p
                LEFT JOIN TBLFIL_PES fp ON p.IDPES = fp.IDPES
                LEFT JOIN TBLFIL f ON fp.IDFIL = f.IDFIL
                WHERE p.IDPES = ?
                ORDER BY f.ANO DESC
            `;
            
            const [linhas] = await db.execute(query, [id]);
            
            if (linhas.length === 0) return res.status(404).json({ erro: "Pessoa não encontrada." });

            const pessoa = {
                id: linhas[0].IDPES.toString(),
                nome: linhas[0].NOMPES,
                tipo: linhas[0].CARGO,
                nascimento: linhas[0].DTANASC,
                falecimento: linhas[0].DTAFAL,
                naturalidade: linhas[0].NATU,
                biografia: linhas[0].BIO,
                filmografia: []
            };

            linhas.forEach(row => {
                if (row.NOMFIL) {
                    pessoa.filmografia.push({
                        titulo: row.NOMFIL,
                        papel: row.PPL,
                        ano: row.ANO
                    });
                }
            });

            res.json(pessoa);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar pessoa.", detalhe: error.message });
        }
    },

    criar: async (req, res) => {
        try {
            const { nompes, cargo, DTANASC, DTAFAL, NATU, BIO } = req.body;
            
            if (!nompes) return res.status(400).json({ erro: "O nome da pessoa (nompes) é obrigatório." });

            const query = `
                INSERT INTO TBLPES (NOMPES, CARGO, DTANASC, DTAFAL, NATU, BIO) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const valores = [
                nompes, 
                cargo || null, 
                DTANASC || null, 
                DTAFAL || null, 
                NATU || null, 
                BIO || null
            ];

            const [result] = await db.execute(query, valores);
            res.status(201).json({ mensagem: "Pessoa adicionada com sucesso!", id: result.insertId, nompes });
        } catch (error) {
            res.status(500).json({ erro: "Erro ao adicionar pessoa.", detalhe: error.message });
        }
    },

    atualizar: async (req, res) => {
        let conn;
        try {
            const id = parseInt(req.params.id);
            
            const { nompes, cargo, nascimento, falecimento, naturalidade, biografia, filmografia } = req.body;
            
            if (!nompes) return res.status(400).json({ erro: "O nome da pessoa (nompes) é obrigatório." });

            conn = await db.getConnection();
            await conn.beginTransaction();

            const queryPessoa = `
                UPDATE TBLPES 
                SET NOMPES = ?, CARGO = ?, DTANASC = ?, DTAFAL = ?, NATU = ?, BIO = ? 
                WHERE IDPES = ?
            `;
            
            const valoresPessoa = [
                nompes, 
                cargo || null, 
                nascimento || null, 
                falecimento || null, 
                naturalidade || null, 
                biografia || null, 
                id
            ];

            const [resultPessoa] = await conn.execute(queryPessoa, valoresPessoa);
            
            if (resultPessoa.affectedRows === 0) {
                await conn.rollback(); 
                conn.release();
                return res.status(404).json({ erro: "Pessoa não encontrada." });
            }

            if (Array.isArray(filmografia)) {
                
                await conn.execute('DELETE FROM TBLFIL_PES WHERE IDPES = ?', [id]);

                if (filmografia.length > 0) {
                    const queryFilme = 'INSERT INTO TBLFIL_PES (IDFIL, IDPES, PPL) VALUES (?, ?, ?)';
                    
                    for (const filme of filmografia) {
                        await conn.execute(queryFilme, [filme.idfil, id, filme.papel || null]);
                    }
                }
            }

            await conn.commit();
            conn.release();

            res.json({ mensagem: "Pessoa e filmografia atualizadas com sucesso!" });

        } catch (error) {
            if (conn) {
                await conn.rollback();
                conn.release();
            }
            res.status(500).json({ erro: "Erro ao atualizar pessoa e filmografia.", detalhe: error.message });
        }
    },

    apagar: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const [result] = await db.execute('DELETE FROM TBLPES WHERE IDPES = ?', [id]);
            
            if (result.affectedRows === 0) return res.status(404).json({ erro: "Pessoa não encontrada." });
            res.json({ mensagem: "Pessoa removida com sucesso!" });
        } catch (error) {
            res.status(500).json({ erro: "Erro ao apagar pessoa.", detalhe: error.message });
        }
    }
};

module.exports = pessoasController;