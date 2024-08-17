import mongoose from "mongoose"; 

const designSchem = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    imageOn: {
        type: String,
        required: true
    },
    imageOff: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: false
    },
    gallery: {
        type: Array,
        required: true
    },
},{timestamps: true})

const Design = mongoose.models.Design ||mongoose.model('Design', designSchem)

export default Design