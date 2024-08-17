import mongoose,{Schema} from "mongoose";

const VisitorsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
},{timestamps:true})

const Visitors = mongoose.models.Visitors || mongoose.model('Visitors', VisitorsSchema)

export default Visitors