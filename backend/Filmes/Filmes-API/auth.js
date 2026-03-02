const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar se o utilizador está autenticado 
 * e se possui a permissão necessária.
 * @param {Array} rolesPermitidas - Lista de roles que podem aceder (ex: ['admin', 'editor'])
 */
const verificarAcesso = (rolesPermitidas = []) => {
    return (req, res, next) => {
        // 1. Obter o token do cabeçalho 'Authorization'
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
        }

        try {
            // 2. Verificar se o token é válido
            const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);
            
            // Guardamos os dados do utilizador na requisição para uso futuro
            req.usuario = usuarioDecodificado;

            // 3. Verificação de Autorização (RBAC)
            // Se a lista de roles permitidas estiver vazia, qualquer utilizador logado entra
            if (rolesPermitidas.length > 0) {
                // No novo sistema, 'roles' é um Array (ex: ['user', 'admin'])
                const temPermissao = usuarioDecodificado.roles.some(role => 
                    rolesPermitidas.includes(role)
                );

                if (!temPermissao) {
                    return res.status(403).json({ 
                        erro: "Proibido: Não tens permissão suficiente para realizar esta ação." 
                    });
                }
            }

            // 4. Se chegou aqui, está tudo OK!
            next();
        } catch (err) {
            return res.status(403).json({ erro: "Token inválido ou expirado." });
        }
    };
};

module.exports = verificarAcesso;