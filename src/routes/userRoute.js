import express from "express"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import user from "../models/user.js"
const router = express.Router()
import auth from "../helpers/auth.js"
router.get("/register", (req,res)=>{
    res.render("users/register")
})
router.get("/login", (req,res)=>{
    res.render("users/login")
})
router.get("/logout", (req,res)=>{
    delete req.session.user
    req.flash("success_msg", "Desconectado com sucesso")
    res.redirect("/")
})
router.post("/login", async (req,res)=>{
    const errors = []
    const password = req.body.password;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const tUser = {
        email : req.body.email.toLowerCase(),
        password : req.body.password
    }
    if (req.body.email.length === 0 || req.body.password.length ===0){
         errors.push({error : "Preencha os campos abaixo"})
    }
    user.findOne({email : req.body.email}).then(async (theUser)=>{
        
        const match = await bcrypt.compare(
            password,
            theUser.password
        )
        if(match){
            req.session.user = {
                id: theUser._id,
                name: theUser.name,
                email: theUser.email
            }
            req.flash("success_msg", "Usuario conectado com sucesso")
                req.session.save(()=>{
            return res.redirect("/")
        })
             
        } else{
            req.flash("error_msg", "Email ou senha inválido")
            return res.render("users/login", {tUser, errors})
        }
    }).catch(()=>{
        req.flash("error_msg", "Usúario não encontrado")
        res.render("users/login", {tUser, errors})
        
    })
})
router.post("/register", async (req,res, next)=>{
    let errors = []
    user.findOne({name : req.body.name}).then((hasUser)=>{
        if(hasUser){
            req.flash("error_msg", "Usuário já existente")
            res.redirect("/users/login")
        }
    })
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    
    if(req.body.name.length < 5){
        errors.push({error : "Nome de usuário menor que 5 digitos;"})
    }
    if(!regex.test(req.body.email)){
        errors.push({error : "Formato de email inválido;"})
    }
    if(req.body.password.length < 8){
        errors.push({error : "Senha menor que 8 digitos;"})
    }
    const newUser = {
        name : req.body.name,
        email : req.body.email.toLowerCase(),
        password : hashedPassword,
    }
    
    if (errors.length === 0) {
        user.create(newUser)
            req.session.user = {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
            req.flash("success_msg", "Usúario criado com sucesso")
            return res.redirect("/")
    }
    
    res.render("users/register", {
        errors,
        tUser : {
        name : req.body.name,
        email : req.body.email.toLowerCase(),
        password : req.body.password
        }
    })
})
export default router