import mongoose from "mongoose"; 
import { generateUniqueString } from "../lib/utils";

const productSchem = new mongoose.Schema({
    reference: {
        type: String,
        required: false,
        default: ()=> generateUniqueString(6)
    },
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
    options: {
        type: Array,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sales: {
        type: Array,
        required: true
    },
    parts: {
        type: Array,
        required: true
    },
    gallery: {
        type: Array,
        required: true
    },
    landingPageImages: {
        type: Array,
        required: false
    },
    dropDowns: {
        type: Array,
        required: true
    },
    active: {
        type: Boolean,
        required: false,
        default: true
    },
},{timestamps: true})

const Product = mongoose.models.Product ||mongoose.model('Product', productSchem)

export default Product