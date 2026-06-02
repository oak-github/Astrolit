import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

function mongoDB(){
mongoose.connect(process.env.DATABASE_URL).then(()=>{
    console.log("MongoDB conectado");
    
}).catch((err)=>{
    console.log("Erro no mongoDB", err);
})}
export default mongoDB