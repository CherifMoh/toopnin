import mongoose,{Schema} from "mongoose";

const RewMatesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    qnts: {
        type: Array,
        required: true
    },
},{timestamps:true})

const RewMates = mongoose.models.RewMates || mongoose.model('RewMates', RewMatesSchema)

export default RewMates