import mongoose,{Schema} from "mongoose";

const pixelIDSchema = new Schema({
    pixelID: {
        type: String,
        required: true
    },
},{timestamps:true})

const PixelID = mongoose.models.PixelID || mongoose.model('PixelID', pixelIDSchema)

export default PixelID