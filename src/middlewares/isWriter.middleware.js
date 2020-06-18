module.exports = {
    isWriter: (req, res, next) => {
        if(req.user.role === 3) {
            return next();
        }

        res.redirect(`/account/login?retURL=${req.originalURL}`);
    }
}