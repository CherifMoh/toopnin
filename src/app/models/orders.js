import mongoose from "mongoose"; 
import { generateUniqueString } from "../lib/utils";

const OrderSchem = new mongoose.Schema({
    DLVTracking: {
        type: String,
        required: false,
        default: ()=> generateUniqueString(9)
    },
    name: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: false
    },
    blackListed: {
        type: Boolean,
        default: false
    },
    instaUserName: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: true
    },
    wilaya: {
        type: String,
        required: false
    },
    commune: {
        type: String,
        required: false
    },
    adresse: {
        type: String,
        required: false
    },
    shippingMethod: {
        type: String,
        required: false
    },
    shippingPrice: {
        type: Number,
        required: false
    },
    totalPrice: {
        type: Number,
        required: false
    },
    orders: {
        type: Array,
        required: true
    },
    state:{
        type: String,
        default: 'غير مؤكدة'
    },
    schedule:{
        type: String,
        default: ''
    },
    deliveryNote:{
        type: String,
        default: ''
    },
    inDelivery:{
        type: Boolean,
        default: false
    },
    tracking:{
        type: String,
        default: ''
    },
    note:{
        type: String,
        default: ''
    },
    
},{timestamps: true})

const Order = mongoose.models.Order ||mongoose.model('Order', OrderSchem)

export default Order