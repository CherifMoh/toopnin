import mongoose,{Schema} from "mongoose";

const fbpixelIDSchema = new Schema({
    pixelID: {
        type: String,
        required: true
    },
},{timestamps:true})

const FBPixelID = mongoose.models.FBPixelID || mongoose.model('FBPixelID', fbpixelIDSchema)

export default FBPixelID