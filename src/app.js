import express from "express"
import book from "../src/models/book.js"
import mongoose from "mongoose"
import session from "express-session"
import connectMongo from "../src/config/db/db.js"
import flash from "connect-flash"
import userRouter from "./routes/userRoute.js"
import user from "../src/models/user.js"
import auth from "./helpers/auth.js"
import { engine } from "express-handlebars"
const app = express()


app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", engine())
app.set("view engine", "handlebars")

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))
app.use(flash())
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

app.get("/", async (req, res) => {
    if (req.session.user) {
        const allBooks = await book.find({ owner: req.session.user.name }).lean()
        res.render("books", { allBooks })
    } else {
        res.render("books")
    }
}
)
app.get("/addbook", auth, async (req, res) => {
    res.render("addBook")
})
app.post("/addbook", auth, (req, res) => {
    const errors = []
    const tBook = {
        title : req.body.title,
        author : req.body.author,
        pages : req.body.pages
    }
    if(req.body.title.length === 0 || req.body.author.length === 0 || req.body.pages.length === 0){
        errors.push({error : "Preencha os campos abaixo"})
        res.render("addBook", {errors, tBook})
    } else{
    book.create({
        title: req.body.title,
        author: req.body.author,
        pages: req.body.pages,
        owner: req.session.user.name
    }).then((bk) => {
        req.flash("success_msg", "Livro criado com sucesso")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Erro na criação do livro")
        res.redirect("/")
    })
}  
})
app.get("/debug", async (req,res)=>{
    const allUsers = await user.find({}).lean()
    res.render("debug", {allUsers})
})
app.get("/editbook/:id", async (req, res) => {
    const id = req.params.id
    const chosenBook = await book.findOne({ _id: id }).lean()
    res.render("editBook", { chosenBook })
})
app.post("/editbook/:id", async (req, res) => {
    book.updateOne({ _id: req.params.id }, {
        title: req.body.title,
        author: req.body.author,
        pages: req.body.pages
    }).then(() => {
        req.flash("success_msg", "Livro editado com sucesso")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao tentar editar o livro")
        res.redirect("/")

    })

})
app.get("/debug/:id",(req,res)=>{
    user.findOneAndDelete({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Usuário deletado com sucesso")
        res.redirect("/debug")
    })
    
})
app.get("/deletebook/:id", (req, res) => {
    book.findOneAndDelete({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Livro deletado com sucesso")
        res.redirect("/")
    })
})
/// ROTAS

await connectMongo()
app.use("/users", userRouter)
const PORT = process.env.PORT || 3000
app.listen(PORT)