import mongoose,{Schema} from "mongoose";

const FetchDateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    
},{timestamps:true})

const FetchDate = mongoose.models.FetchDate || mongoose.model('FetchDate', FetchDateSchema)

export default FetchDate