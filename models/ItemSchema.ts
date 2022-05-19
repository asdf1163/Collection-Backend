import { Schema, model } from 'mongoose';
import { Iitem } from '../../frontend/src/interfaces/collections.interfaces';

export const itemSchema = new Schema<Iitem>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true, text: true },
    collectionId: { type: Schema.Types.ObjectId, required: true },
    tags: { type: [String], required: true, text: true },
    linkImg: { type: String },
    additional: [{ type: Object }],
    ownerId: { type: Schema.Types.ObjectId, default: "" },
    creationDate: { type: Date, default: Date.now, required: true },
    likes: { type: [Schema.Types.ObjectId], default: [] },
    comments: [{
        userId: { type: Schema.Types.ObjectId, required: true },
        message: { type: String, text: true },
    }]
});

export default model("Item", itemSchema)
