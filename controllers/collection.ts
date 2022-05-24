import { Types } from 'mongoose'
import CollectionModel from '../models/CollectionSchema'
import { Icollection } from "../interfaces/collections.interfaces";
import item from './item';

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

const findCollection = async (userId: string, additionalOption: object = {}) => {
    if (userId.match(/^[0-9a-fA-F]{24}$/))
        return await CollectionModel.find({ idUser: new Types.ObjectId(userId) }, additionalOption);
    else return []
}

const findItemsInCollection = async (collectionId: string) => {
    return await CollectionModel.aggregate([{
        $match: {
            _id: new Types.ObjectId(collectionId)
        }
    }, {
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
            as: 'users'
        }
    }, {
        $unwind: {
            path: '$users'
        }
    }, {
        $project: {
            'users.password': 0
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
    return await CollectionModel.updateOne({ _id: collectionId }, { $set: data })
}

const deleteCollection = async (collectionId: string) => {
    return await CollectionModel.deleteOne({ _id: collectionId })
}

const deleteUserCollectionAndItems = async (userId: string, type = "") => {
    const collectionIdList = await findCollection(userId, { _id: 1 })
    await item.deleteManyItems({ collectionId: { $in: collectionIdList } })
    return await CollectionModel.deleteMany({ _id: { $in: collectionIdList } })
}


export default { constructCollection, findCollection, findItemsInCollection, createCollection, updateCollection, deleteCollection, largestCollection, deleteUserCollectionAndItems }

