import mongoose from "mongoose";

function mongoDB(){
mongoose.connect("mongodb://127.0.0.1:27017/astrolit").then(()=>{
    console.log("MongoDB conectado");
    
}).catch((err)=>{
    console.log("Erro no mongoDB", err);
})}
export default mongoDB