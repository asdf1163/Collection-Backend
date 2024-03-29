import { Schema, model } from 'mongoose'
import { IuserSchema } from '../interfaces/users.interfaces';

const userSchema = new Schema<IuserSchema>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true, },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, default: 'unlocked', lowercase: true },
    privilage: { type: String, required: true, lowercase: true, default: 'user' },
});

export default model("User", userSchema)