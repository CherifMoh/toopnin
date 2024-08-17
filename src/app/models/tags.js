import mongoose from "mongoose"; 

const tagSchem = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
},{timestamps: true})

const Tage = mongoose.models.Tage ||mongoose.model('Tage', tagSchem)

export default Tage