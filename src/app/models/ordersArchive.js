import mongoose,{Schema} from "mongoose";

const OrdersArchiveSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    tracking: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: false,
        default: ''
    },
    action: {
        type: String,
        required: true
    },
},{timestamps:true})

const OrdersArchive = mongoose.models.OrdersArchive || mongoose.model('OrdersArchive', OrdersArchiveSchema)

export default OrdersArchive