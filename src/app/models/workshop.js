import mongoose,{Schema} from "mongoose";

const WorkshopSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    qnts: {
        type: Array,
        required: true
    },

},{timestamps:true})

const Workshop = mongoose.models.Workshop || mongoose.model('Workshop', WorkshopSchema)

export default Workshop