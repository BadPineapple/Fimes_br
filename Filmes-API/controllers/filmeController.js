const db = require('../db/db'); // Ajustar o caminho para a conexão com o MySQL

// Função auxiliar para extrair apenas os dados da tabela principal do filme
const extrairDadosBaseFilme = (dados) => {
    return {
        titulo: String(dados.titulo || '').trim(),
        sinopse: String(dados.sinopse || '').trim(),
        imagens: String(dados.imagens || '').trim(),
        duracao: String(dados.duracao || '').trim(),
        ano: Number(dados.ano) || null,
        tmdb_id: dados.tmdb_id ? Number(dados.tmdb_id) : null,
        nota_externa: dados.nota_externa ? parseFloat(dados.nota_externa) : null
    };
};

const filmeController = {
    listarTodos: async (req, res) => {
        try {
            const [filmes] = await db.execute('SELECT * FROM TBLFIL');
            res.json(filmes);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar filmes no banco de dados." });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const [filmes] = await db.execute('SELECT * FROM TBLFIL WHERE id = ?', [id]);

            if (filmes.length === 0) {
                return res.status(404).json({ erro: "Filme não encontrado." });
            }

            res.json(filmes[0]);
        } catch (error) {
            res.status(500).json({ erro: "Erro ao buscar filme.", detalhe: error.message });
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
                `INSERT INTO TBLFIL (titulo, sinopse, imagens, duracao, ano, tmdb_id, nota_externa) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    baseFilme.titulo, baseFilme.sinopse, baseFilme.imagens, 
                    baseFilme.duracao, baseFilme.ano, baseFilme.tmdb_id, baseFilme.nota_externa
                ]
            );

            const idFilme = resultFilme.insertId;

            // Nova função para processar itens mistos (IDs existentes e textos novos)
            const processarRelacaoDinamica = async (conexao, idFilme, tabelaMestre, colunaMestre, tabelaRelacao, colunaRelacaoId, arrayItems, papel = null) => {
                if (!Array.isArray(arrayItems) || arrayItems.length === 0) return;

                const idsParaInserir = [];

                for (const item of arrayItems) {
                    if (item.novo) {
                        // 1. Se é novo, insere na tabela mestre primeiro (ex: TBLPESSOA, TBLGENERO)
                        const [result] = await conexao.execute(
                            `INSERT INTO ${tabelaMestre} (${colunaMestre}) VALUES (?)`,
                            [item.nome]
                        );
                        // Guarda o ID que o MySQL acabou de gerar
                        idsParaInserir.push(result.insertId);
                    } else if (item.id) {
                        // 2. Se já existe, apenas guarda o ID
                        idsParaInserir.push(item.id);
                    }
                }

                if (idsParaInserir.length === 0) return;

                // 3. Insere na tabela de relação (ex: TBLFIL_PES)
                let query = `INSERT IGNORE INTO ${tabelaRelacao} (filme_id, ${colunaRelacaoId}`;
                query += papel ? ', papel) VALUES ' : ') VALUES ';

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

            // Chamadas dinâmicas. Nota: Ajuste os nomes das tabelas (ex: TBLGENERO) e colunas (ex: 'genero' ou 'nome') se forem diferentes no seu MySQL.
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPESSOA', 'nome', 'TBLFIL_PES', 'pessoa_id', elenco, 'Elenco');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPESSOA', 'nome', 'TBLFIL_PES', 'pessoa_id', diretor, 'Diretor');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPESSOA', 'nome', 'TBLFIL_PES', 'pessoa_id', roterista, 'Roterista');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLGENERO', 'genero', 'TBLFIL_GEN', 'genero_id', generos);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLTAG', 'nome', 'TBLFIL_TAG', 'tag_id', tags);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPLATAFORMA', 'nome', 'TBLFIL_PLA', 'plataforma_id', plataformas);

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
                 SET titulo = ?, sinopse = ?, imagens = ?, duracao = ?, ano = ?, tmdb_id = ?, nota_externa = ? 
                 WHERE id = ?`,
                [
                    baseFilme.titulo, baseFilme.sinopse, baseFilme.imagens, 
                    baseFilme.duracao, baseFilme.ano, baseFilme.tmdb_id, baseFilme.nota_externa, idFilme
                ]
            );

            await conexao.execute('DELETE FROM TBLFIL_PES WHERE filme_id = ?', [idFilme]);
            await conexao.execute('DELETE FROM TBLFIL_GEN WHERE filme_id = ?', [idFilme]);
            await conexao.execute('DELETE FROM TBLFIL_TAG WHERE filme_id = ?', [idFilme]);
            await conexao.execute('DELETE FROM TBLFIL_PLA WHERE filme_id = ?', [idFilme]);

            // Nova função para processar itens mistos (IDs existentes e textos novos)
            const processarRelacaoDinamica = async (conexao, idFilme, tabelaMestre, colunaMestre, tabelaRelacao, colunaRelacaoId, arrayItems, papel = null) => {
                if (!Array.isArray(arrayItems) || arrayItems.length === 0) return;

                const idsParaInserir = [];

                for (const item of arrayItems) {
                    if (item.novo) {
                        // 1. Se é novo, insere na tabela mestre primeiro (ex: TBLPESSOA, TBLGENERO)
                        const [result] = await conexao.execute(
                            `INSERT INTO ${tabelaMestre} (${colunaMestre}) VALUES (?)`,
                            [item.nome]
                        );
                        // Guarda o ID que o MySQL acabou de gerar
                        idsParaInserir.push(result.insertId);
                    } else if (item.id) {
                        // 2. Se já existe, apenas guarda o ID
                        idsParaInserir.push(item.id);
                    }
                }

                if (idsParaInserir.length === 0) return;

                // 3. Insere na tabela de relação (ex: TBLFIL_PES)
                let query = `INSERT IGNORE INTO ${tabelaRelacao} (filme_id, ${colunaRelacaoId}`;
                query += papel ? ', papel) VALUES ' : ') VALUES ';

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

            // Chamadas dinâmicas. Nota: Ajuste os nomes das tabelas (ex: TBLGENERO) e colunas (ex: 'genero' ou 'nome') se forem diferentes no seu MySQL.
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPESSOA', 'nome', 'TBLFIL_PES', 'pessoa_id', elenco, 'Elenco');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPESSOA', 'nome', 'TBLFIL_PES', 'pessoa_id', diretor, 'Diretor');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPESSOA', 'nome', 'TBLFIL_PES', 'pessoa_id', roterista, 'Roterista');
            await processarRelacaoDinamica(conexao, idFilme, 'TBLGENERO', 'genero', 'TBLFIL_GEN', 'genero_id', generos);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLTAG', 'nome', 'TBLFIL_TAG', 'tag_id', tags);
            await processarRelacaoDinamica(conexao, idFilme, 'TBLPLATAFORMA', 'nome', 'TBLFIL_PLA', 'plataforma_id', plataformas);

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

            const [result] = await db.execute('DELETE FROM TBLFIL WHERE id = ?', [id]);

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