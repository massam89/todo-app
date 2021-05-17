module.exports = {
    ensureAuthenticated2: function(req, res, next) {
        if(req.isAuthenticated()) {
            return res.redirect('/dashboard');
        }
       return next()
        
    }
}