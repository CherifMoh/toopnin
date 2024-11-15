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
    code: {
        type: String,
        required: false
    },
    imageOn: {
        type: String,
        required: true
    },
    imageOff: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    HomeOnly: {
        type: Boolean,
        default: true
    },
    options: {
        type: Array,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    beforePrice: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    sales: {
        type: Array,
        required: true
    },
    parts: {
        type: Array,
        required: false
    },
    gallery: {
        type: Array,
        required: false
    },
    landingPageImages: {
        type: Array,
        required: false
    },
    dropDowns: {
        type: Array,
        required: false
    },
    qnts: {
        type: Array,
        required: false
    },
    active: {
        type: Boolean,
        required: false,
        default: true
    },
},{timestamps: true})

const Product = mongoose.models.Product ||mongoose.model('Product', productSchem)

export default Product