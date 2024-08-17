import mongoose,{Schema} from "mongoose";

const ArchiveSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
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