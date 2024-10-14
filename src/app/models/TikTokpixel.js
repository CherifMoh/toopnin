import mongoose,{Schema} from "mongoose";

const TikTokpixelIDSchema = new Schema({
    pixelID: {
        type: String,
        required: true
    },
},{timestamps:true})

const TikTokPixelID = mongoose.models.TikTokPixelID || mongoose.model('TikTokPixelID', TikTokpixelIDSchema)

export default TikTokPixelID