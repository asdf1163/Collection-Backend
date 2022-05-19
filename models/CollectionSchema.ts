
import { Schema, model } from 'mongoose';
import { Icollection } from '../interfaces/collections.interfaces';

const collectionSchema = new Schema<Icollection>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    idUser: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    topic: { type: String, required: true },
    tags: { type: [String], default: [""] },
    additional: [{
        name: { type: String },
        value: { type: String }
    }],
    linkImg: { type: String, default: "" },
    creationDate: { type: Date, default: Date.now, required: true }
});

export default model("Collection", collectionSchema)