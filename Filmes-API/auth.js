require('dotenv').config();
const jwt = require('jsonwebtoken');


const verificarAcesso = (rolesPermitidas = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
        }

        try {
            const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);
            
            req.usuario = usuarioDecodificado;

            if (rolesPermitidas.length > 0) {
                const userRoles = usuarioDecodificado.roles || [];
                
                const temPermissao = userRoles.some(role => 
                    rolesPermitidas.includes(role)
                );

                if (!temPermissao) {
                    return res.status(403).json({ 
                        erro: "Proibido: Não tem permissão suficiente para realizar esta ação." 
                    });
                }
            }

            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ erro: "A sessão expirou. Por favor, inicie sessão novamente." });
            }
            return res.status(403).json({ erro: "Token inválido ou adulterado." });
        }
    };
};

module.exports = {
    verificarAcesso,
    somenteAdmin: verificarAcesso(['admin']),
    autenticado: verificarAcesso()
};