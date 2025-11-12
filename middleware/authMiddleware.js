const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.session.token;

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les initiales pour l'avatar
        if (decoded.prenom && decoded.nom) {
            decoded.initiales = (decoded.prenom.charAt(0) + decoded.nom.charAt(0)).toUpperCase();
        }
        
        req.user = decoded;
        res.locals.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/auth/login');
    }
};

const optionalAuth = (req, res, next) => {
    const token = req.cookies.token || req.session.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Ajouter les initiales pour l'avatar
            if (decoded.prenom && decoded.nom) {
                decoded.initiales = (decoded.prenom.charAt(0) + decoded.nom.charAt(0)).toUpperCase();
            }
            
            req.user = decoded;
            res.locals.user = decoded;
        } catch (error) {
            // Token invalide, mais on continue quand même
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
    }
    
    next();
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).render('error', {
                message: 'Accès non autorisé',
                layout: 'main'
            });
        }
        next();
    };
};

module.exports = { authMiddleware, optionalAuth, checkRole };