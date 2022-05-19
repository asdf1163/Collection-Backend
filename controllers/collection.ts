import { Types } from 'mongoose'

import { Icollection } from "../../frontend/src/interfaces/collections.interfaces";
import CollectionModel from '../models/CollectionSchema'

const constructCollection = ({ idUser, name, description, topic, tags, additional, linkImg }: Icollection) => {
    return new CollectionModel({
        idUser: idUser,
        name: name,
        description: description,
        topic: topic,
        tags: tags,
        additional: additional,
        linkImg: linkImg
    })
}

const largestCollection = async () => {
    return await CollectionModel.aggregate([{
        $lookup: {
            from: 'items',
            localField: '_id',
            foreignField: 'collectionId',
            as: 'items'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'idUser',
            foreignField: '_id',
            as: 'user'
        }
    }, {
        $project: {
            _id: '$_id',
            name: '$name',
            description: '$description',
            tags: '$tags',
            username: {
                $first: '$user.username'
            },
            itemCount: {
                $size: '$items'
            }
        }
    }, {
        $sort: {
            itemCount: -1
        }
    }, {
        $limit: 5
    }])
}

const findCollection = async (userId: string) => {
    if (userId.match(/^[0-9a-fA-F]{24}$/))
        return await CollectionModel.find({ idUser: new Types.ObjectId(userId) });
    else return []
}

const findItemsInCollection = async (collectionId: string, itemId = "") => {
    return await CollectionModel.aggregate([{
        $lookup: {
            from: 'items',
            localField: '_id',
            foreignField: 'collectionId',
            as: 'items'
        }
    }, {
        $match: {
            _id: new Types.ObjectId(collectionId),
        }
    }])
}
const createCollection = async (data: Icollection) => {
    try {
        const collection = constructCollection(data)
        return await collection.save()
    }
    catch (error) {
        throw error
    }
}

const updateCollection = async (collectionId: string, data: Icollection) => {
    const result = await CollectionModel.updateOne({ _id: collectionId }, { $set: data })
}

const deleteCollection = async (collectionId: string) => {
    const result = await CollectionModel.deleteOne({ _id: collectionId })
}


export default { constructCollection, findCollection, findItemsInCollection, createCollection, updateCollection, deleteCollection, largestCollection }

