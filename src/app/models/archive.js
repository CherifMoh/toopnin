import mongoose,{Schema} from "mongoose";

const ArchiveSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
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
    price: {
        type: Number,
        required: false,
        default: null
    },
    qnt: {
        type: Number,
        required: true
    },
},{timestamps:true})

const Archive = mongoose.models.Archive || mongoose.model('Archive', ArchiveSchema)

export default Archive