const db = require('../db/db');

const extrairDadosBaseFilme = (dados) => {
    return {
        titulo:  String(dados.titulo  || '').trim(),
        sinopse: String(dados.sinopse || '').trim(),
        idImagem: dados.idImagem ? Number(dados.idImagem) : null, 
        duracao: String(dados.duracao || '').trim(),
        ano: Number(dados.ano) || null,
        tmdb_id: dados.tmdb_id ? Number(dados.tmdb_id) : null,
        nota_externa: dados.nota_externa ? parseFloat(dados.nota_externa) : null
    };
};

const filmeController = {
    listarTodos: async (req, res) => {
        try {
            const { titulo, genero, tag, plataforma, pessoa, ano, ordenarPor } = req.query;

            let query = `
                SELECT 
                    f.*, 
                    i.LOCAL AS CAMINHO_IMAGEM, 
                    i.IDIMG AS ID_IMAGEM,
                    GROUP_CONCAT(DISTINCT g.NOMGEN) AS LISTA_GENEROS
                FROM TBLFIL f
                LEFT JOIN TBLIMG i ON f.IMG = i.IDIMG
                LEFT JOIN TBLFIL_GEN fg ON f.IDFIL = fg.IDFIL
                LEFT JOIN TBLGEN g ON fg.IDGEN = g.IDGEN
            `;
            
            const queryParams = [];
            const conditions = [];

            if (genero) {
                conditions.push('f.IDFIL IN (SELECT IDFIL FROM TBLFIL_GEN WHERE IDGEN = ?)');
                queryParams.push(genero);
            }
            if (tag) {
                conditions.push('f.IDFIL IN (SELECT IDFIL FROM TBLFIL_TAG WHERE IDTAG = ?)');
                queryParams.push(tag);
            }
            if (plataforma) {
                conditions.push('f.IDFIL IN (SELECT IDFIL FROM TBLFIL_PLA WHERE IDPLA = ?)');
                queryParams.push(plataforma);
            }
            if (pessoa) {
                conditions.push('f.IDFIL IN (SELECT IDFIL FROM TBLFIL_PES WHERE IDPES = ?)');
                queryParams.push(pessoa);
            }

            if (titulo) {
                conditions.push('f.NOMFIL LIKE ?');
                queryParams.push(`%${titulo}%`);
            }
            if (ano) {
                conditions.push('f.ANO = ?');
                queryParams.push(ano);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' GROUP BY f.IDFIL, i.IDIMG';

            let orderClause = ' ORDER BY f.NOMFIL ASC';
            if (ordenarPor === 'nome_desc') orderClause = ' ORDER BY f.NOMFIL DESC';
            if (ordenarPor === 'nota_desc') orderClause = ' ORDER BY f.NOTEXT DESC';
            if (ordenarPor === 'nota_asc') orderClause = ' ORDER BY f.NOTEXT ASC';
            if (ordenarPor === 'ano_desc') orderClause = ' ORDER BY f.ANO DESC';
            if (ordenarPor === 'ano_asc') orderClause = ' ORDER BY f.ANO ASC';

            query += orderClause;

            const [rows] = await db.execute(query, queryParams);

            const filmesFormatados = rows.map(row => ({
                ...row,
                IMAGEM: row.CAMINHO_IMAGEM ? [{ IDIMG: row.ID_IMAGEM, LOCAL: row.CAMINHO_IMAGEM }] : [],
                GENEROS: row.LISTA_GENEROS || ""
            }));

            res.json(filmesFormatados);

        } catch (error) {
            console.error("Erro na filtragem:", error);
            res.status(500).json({ erro: "Erro ao buscar filmes." });
        }
    },

    buscarPessoas: async (req, res) => {
        try {
            const { busca } = req.query;
            if (!busca) return res.json([]);
            
            const [pessoas] = await db.execute(
                'SELECT IDPES, NOMPES FROM TBLPES WHERE NOMPES LIKE ? LIMIT 10',
                [`%${busca}%`]
            );
            res.json(pessoas);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar pessoas." });
        }
    },

    buscarPorId: async (req, res) => {
        const { id } = req.params;
        try {
            const [filmeRows] = await db.query(
                "SELECT * FROM tblfil WHERE IDFIL = ?", 
                [id]
            );

            if (filmeRows.length === 0) {
                return res.status(404).json({ message: "Filme não encontrado" });
            }

            const filme = filmeRows[0];

            const [generos] = await db.query(`
                SELECT g.IDGEN, g.NOMGEN 
                FROM tblgen g
                INNER JOIN tblfil_gen fg ON g.IDGEN = fg.IDGEN
                WHERE fg.IDFIL = ?`, [id]);

            const [pessoas] = await db.query(`
                SELECT p.IDPES, p.NOMPES 
                FROM tblpes p
                INNER JOIN tblfil_pes fp ON p.IDPES = fp.IDPES
                WHERE fp.IDFIL = ?`, [id]);

            const [plataformas] = await db.query(`
                SELECT pl.IDPLA, pl.NOMPLA 
                FROM tblpla pl
                INNER JOIN tblfil_pla fp ON pl.IDPLA = fp.IDPLA
                WHERE fp.IDFIL = ?`, [id]);

            const [imagens] = await db.query(`
                SELECT i.IDIMG, i.LOCAL 
                FROM TBLIMG i
                INNER JOIN tblfil f ON i.IDIMG = f.IMG
                WHERE f.IDFIL = ?`, [id]);

            const resultado = {
                ...filme,
                GENEROS: generos,
                DIRETORES: pessoas,
                PLATAFORMAS: plataformas,
                IMAGEM: imagens
            };

            res.json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    criar: async (req, res) => {
        const conexao = await db.getConnection();
        try {
            await conexao.beginTransaction();

            const { 
                elenco = [], 
                diretor = [], 
                roterista = [], 
                generos = [], 
                tags = [], 
                plataformas = [] 
            } = req.body;

            const baseFilme = extrairDadosBaseFilme(req.body);

            const [resultFilme] = await conexao.execute(
                `INSERT INTO TBLFIL (NOMFIL, SINOPSE, IMAGEM, DURACAO, ANO, NOTEXT, NOTEXT) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    baseFilme.titulo, baseFilme.sinopse, baseFilme.idImagem, 
                    baseFilme.duracao, baseFilme.ano, baseFilme.tmdb_id, baseFilme.nota_externa
                ]
            );

            const idFilme = resultFilme.insertId;

            const processarRelacaoDinamica = async (conexao, idFilme, tabelaMestre, colunaMestre, tabelaRelacao, colunaRelacaoId, arrayItems, papel = null) => {
                if (!Array.isArray(arrayItems) || arrayItems.length === 0) return;

                const idsParaInserir = [];

                for (const item of arrayItems) {
                    if (item.novo) {
                        const [result] = await conexao.execute(
                            `INSERT INTO ${tabelaMestre} (${colunaMestre}) VALUES (?)`,
                            [item.nome]
                        );
                        idsParaInserir.push(result.insertId);
                    } else if (item.id) {
                        idsParaInserir.push(item.id);
                    }
                }

                if (idsParaInserir.length === 0) return;

                let query = `INSERT IGNORE INTO ${tabelaRelacao} (IDFIL, ${colunaRelacaoId}`;
                query += papel ? ', FUNC) VALUES ' : ') VALUES ';

                const values = [];
                const placeholders = idsParaInserir.map(id => {
                    if (papel) {
                        values.push(idFilme, id, papel);
                        return '(?, ?, ?)';
                    }
                    values.push(idFilme, id);
                    return '(?, ?)';
                }).join(', ');

                await conexao.execute(query + placeholders, values);
            };

            await processarRelacaoDinamica(conexao, idFilme, 'TBLPES', 'NOMPES', 'TBLFIL_PES', 'IDPES', elenco, 'Elenco');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPES', 'NOMPES', 'TBLFIL_PES', 'IDPES', diretor, 'Diretor');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPES', 'NOMPES', 'TBLFIL_PES', 'IDPES', roterista, 'Roterista');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLGEN', 'NOMGEN', 'TBLFIL_GEN', 'IDGEN', generos);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLTAG', 'NOMTAG', 'TBLFIL_TAG', 'IDTAG', tags);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPLA', 'NOMPLA', 'TBLFIL_PLA', 'IDPLA', plataformas);

            await conexao.commit();
            res.status(201).json({ mensagem: "Filme inserido com sucesso!", id: idFilme });

        } catch (error) {
            await conexao.rollback();
            res.status(400).json({ erro: "Erro ao inserir filme.", detalhe: error.message });
        } finally {
            conexao.release();
        }
    },

    atualizar: async (req, res) => {
        const conexao = await db.getConnection();
        try {
            await conexao.beginTransaction();

            const idFilme = parseInt(req.params.id);
            const { 
                elenco = [], 
                diretor = [], 
                roterista = [], 
                generos = [], 
                tags = [], 
                plataformas = [] 
            } = req.body;

            const baseFilme = extrairDadosBaseFilme(req.body);

            await conexao.execute(
                `UPDATE TBLFIL 
                 SET NOMFIL = ?, SINOPSE = ?, IMG = ?, DURACAO = ?, ANO = ?, NOTEXT = ?, NOTEXT = ? 
                 WHERE IDFIL = ?`,
                [
                    baseFilme.titulo, baseFilme.sinopse, baseFilme.idImagem, 
                    baseFilme.duracao, baseFilme.ano, baseFilme.tmdb_id, baseFilme.nota_externa, idFilme
                ]
            );

            await conexao.execute('DELETE FROM TBLFIL_PES WHERE IDFIL = ?', [idFilme]);
            await conexao.execute('DELETE FROM TBLFIL_GEN WHERE IDFIL = ?', [idFilme]);
            await conexao.execute('DELETE FROM TBLFIL_TAG WHERE IDFIL = ?', [idFilme]);
            await conexao.execute('DELETE FROM TBLFIL_PLA WHERE IDFIL = ?', [idFilme]);

            const processarRelacaoDinamica = async (conexao, idFilme, tabelaMestre, colunaMestre, tabelaRelacao, colunaRelacaoId, arrayItems, cargo = null) => {
                if (!Array.isArray(arrayItems) || arrayItems.length === 0) return;

                const idsParaInserir = [];

                for (const itemNome of arrayItems) {
                    if (!itemNome || typeof itemNome !== 'string') continue;
                    
                    const nomeLimpo = itemNome.trim();
                    if (!nomeLimpo) continue;

                    const [rows] = await conexao.execute(`SELECT ${colunaRelacaoId} FROM ${tabelaMestre} WHERE ${colunaMestre} = ? LIMIT 1`, [nomeLimpo]);
                    
                    let itemId;

                    if (rows.length > 0) {
                        itemId = rows[0][colunaRelacaoId];
                    } else {
                        const [result] = await conexao.execute(`INSERT INTO ${tabelaMestre} (${colunaMestre}) VALUES (?)`, [nomeLimpo]);
                        itemId = result.insertId;
                    }

                    idsParaInserir.push(itemId);
                }

                if (idsParaInserir.length === 0) return;

                let query = `INSERT IGNORE INTO ${tabelaRelacao} (IDFIL, ${colunaRelacaoId}`;
                query += cargo ? ', FUNC) VALUES ' : ') VALUES ';

                const values = [];
                const placeholders = idsParaInserir.map(id => {
                    if (cargo) {
                        values.push(idFilme, id, cargo);
                        return '(?, ?, ?)';
                    }
                    values.push(idFilme, id);
                    return '(?, ?)';
                }).join(', ');

                await conexao.execute(query + placeholders, values);
            };

            await processarRelacaoDinamica(conexao, idFilme, 'TBLPES', 'NOMPES', 'TBLFIL_PES', 'IDPES', elenco, 'Ator');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPES', 'NOMPES', 'TBLFIL_PES', 'IDPES', diretor, 'Diretor');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPES', 'NOMPES', 'TBLFIL_PES', 'IDPES', roterista, 'Roteirista');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLGEN', 'NOMGEN', 'TBLFIL_GEN', 'IDGEN', generos);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLTAG', 'NOMTAG', 'TBLFIL_TAG', 'IDTAG', tags);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPLA', 'NOMPLA', 'TBLFIL_PLA', 'IDPLA', plataformas);

            await conexao.commit();
            res.json({ mensagem: "Filme atualizado com sucesso!", id: idFilme });
        } catch (error) {
            await conexao.rollback();
            res.status(400).json({ erro: "Erro ao atualizar filme.", detalhe: error.message });
        } finally {
            conexao.release();
        }
    },

    apagar: async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            const [result] = await db.execute('DELETE FROM TBLFIL WHERE IDFIL = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: "Filme não encontrado." });
            }

            res.json({ mensagem: `Filme removido com sucesso!` });
        } catch (error) {
            res.status(500).json({ erro: "Erro ao apagar filme.", detalhe: error.message });
        }
    }
};

module.exports = filmeController;