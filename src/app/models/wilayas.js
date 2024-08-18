import mongoose,{Schema} from "mongoose";

const WilayasSchema = new Schema({
    wilayas: {
        type: Array,
        required: true
    },
    fees: {
        type: Object,
        required: true
    },
    communes: {
        type: Object,
        required: true
    },
},{timestamps:true})

const Wilayas = mongoose.models.Wilayas || mongoose.model('Wilayas', WilayasSchema)

export default Wilayas