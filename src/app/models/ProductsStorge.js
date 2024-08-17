import mongoose,{Schema} from "mongoose";

const ProductsStorageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    qnts: {
        type: Array,
        required: true
    },
},{timestamps:true})

const ProductsStorage = mongoose.models.ProductsStorage || mongoose.model('ProductsStorage', ProductsStorageSchema)

export default ProductsStorage