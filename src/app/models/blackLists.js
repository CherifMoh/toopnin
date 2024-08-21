import mongoose from 'mongoose';

const BlackListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: 'IP'
    },
    ip: {
        type: Array, // Use [String] for an array of strings
        required: true
    },
}, { timestamps: true });

const BlackList = mongoose.models.BlackList || mongoose.model('BlackList', BlackListSchema);

export default BlackList;
