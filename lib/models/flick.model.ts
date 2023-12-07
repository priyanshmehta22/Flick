
import mongoose from 'mongoose';


const flickSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    parentId: { type: String },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flick'
    }]
})

const Flick = mongoose.models.Flick || mongoose.model('Flick', flickSchema);

export default Flick;