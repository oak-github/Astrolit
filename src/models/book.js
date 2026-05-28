import mongoose, { mongo } from "mongoose";

const book = new mongoose.Schema({
    title : {
        type: String,
        required : true,
        unique : true
    },
    author : {
        type: String,
        required : true,
        unique : true
    },
    pages : {
        type: Number,
        required : true
    },
    owner: {
        type: String,
        required : true
    }
})
export default mongoose.model("book", book)