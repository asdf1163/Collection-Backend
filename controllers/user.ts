import { Types } from 'mongoose'
import UserModel from "../models/UserSchema";
import { IuserSchema } from "../interfaces/users.interfaces";

const userCreator = ({ username, password, email }: { username: string, password: string, email: string }) => new UserModel({
    username,
    password,
    email
})

const findUserSingup = async ({ username, email }: { username: string, email: string }) => {
    try {
        return await UserModel.findOne({ $or: [{ username: username }, { email: email }] })
    }
    catch (error) {
        throw new Error(`Error:  ${error}`)
    }
}

const findUserSignin = async ({ username, password }: { username: string, password: string }): Promise<IuserSchema | null> => {
    try {
        return await UserModel.findOne({ username, password })
    }
    catch (error) {
        throw new Error(`Error:  ${error}`)
    }
}

const findUser = async (param: object) => {
    try {
        return await UserModel.find(param)
    }
    catch (error) {
        throw new Error(`Error:  ${error}`)
    }
}

const createUser = async (data: { username: string, password: string, email: string }) => {
    try {
        const user = userCreator(data)
        return await user.save()
    }
    catch (error) {
        throw new Error(`Error: ${error}`)
    }
}

const updateUser = async (idUser: string, params: object) => {
    return await UserModel.updateOne({ _id: new Types.ObjectId(idUser) }, { $set: params })
}

const deleteUser = async (idUser: string) => {
    return await UserModel.deleteOne({ _id: new Types.ObjectId(idUser) })
}

const userExist = async (param: object) => {
    return await UserModel.findOne(param)
}

const likeItem = async (itemId: string, userId: string) => {
    try {
        const ifExist = await UserModel.findOne({ _id: new Types.ObjectId(userId), likes: new Types.ObjectId(itemId) })
        if (ifExist === null) {
            return await UserModel.updateOne({ _id: new Types.ObjectId(userId) }, { $addToSet: { likes: new Types.ObjectId(itemId) } }, { upsert: true })
        } else {
            return await UserModel.updateOne({ _id: new Types.ObjectId(userId) }, { $pull: { likes: new Types.ObjectId(itemId) } })
        }
    } catch (error) {
        throw error
    }
}

export default { findUserSingup, findUserSignin, createUser, findUser, updateUser, deleteUser, userExist, likeItem }