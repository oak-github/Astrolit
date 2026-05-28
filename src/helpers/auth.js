function auth(req,res,next){
    if(!req.session.user){
        req.flash("error_msg", "Necessário autenticação") 
        res.redirect("/users/login")  
    } else {
        next()
    }
}

export default auth