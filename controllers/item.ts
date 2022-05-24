import { Types } from 'mongoose'
import { Iitem } from "../interfaces/collections.interfaces";
import ItemModel from '../models/ItemSchema'

const constructItem = ({ name, collectionId, tags, additional, ownerId, linkImg }: Iitem) => {
    return new ItemModel({
        name: name,
        collectionId: new Types.ObjectId(collectionId),
        tags: tags,
        additional: additional,
        ownerId: ownerId,
        linkImg: linkImg
    })
}

const searchItem = async (searchQuery: string) => {
    return await ItemModel.aggregate([
        {
            $search: {
                index: 'default',
                text: {
                    query: searchQuery,
                    path: {
                        'wildcard': '*'
                    }
                }
            }
        },
        {
            $limit: 10
        }
    ])
}

const findItem = async (query: object) => {
    return await ItemModel.find(query)
}

const findItemById = async (itemId: string) => {
    if (itemId.match(/^[0-9a-fA-F]{24}$/)) {
        return await ItemModel.aggregate([{
            $lookup: {
                from: 'users',
                localField: 'ownerId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            _id: '$_id',
                            username: '$username'
                        }
                    }
                ],
                as: 'owner'
            }
        }, {
            $match: {
                _id: new Types.ObjectId(itemId)
            }
        }, {
            $unwind: {
                path: '$owner'
            }
        }])
    }
    else return []
}

const findLatestItems = async () => {
    return await ItemModel.aggregate([{
        $lookup: {
            from: 'collections',
            localField: 'collectionId',
            foreignField: '_id',
            as: 'collection'
        }
    }, {
        $unwind: {
            path: '$collection',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'collection.idUser',
            foreignField: '_id',
            as: 'user'
        }
    }, {
        $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $sort: {
            creationDate: -1
        }
    },
    {
        $limit: 10
    }])
}

const addItem = async (data: Iitem) => {
    try {
        const item = constructItem(data)
        return await item.save()
    }
    catch (error) {
        throw error
    }
}

const userLikedItem = async (itemId: string, userId: string) => {
    if (itemId && userId) {
        const result = await ItemModel.findOne({ _id: new Types.ObjectId(itemId), likes: new Types.ObjectId(userId) })
        return result === null
    }
    else return []
}

const likeItem = async (itemId: string, userId: string) => {
    try {
        if (await userLikedItem(itemId, userId)) {
            return await ItemModel.updateOne({ _id: new Types.ObjectId(itemId) }, { $addToSet: { likes: new Types.ObjectId(userId) } })
        } else {
            return await ItemModel.updateOne({ _id: new Types.ObjectId(itemId) }, { $pull: { likes: new Types.ObjectId(userId) } })
        }
    } catch (error) {
        throw error
    }
}

const commentItem = async (itemId: string, userId: string, message: string) => {
    return await ItemModel.updateOne({ _id: itemId },
        {
            $addToSet: {
                comments:
                {
                    userId: new Types.ObjectId(userId),
                    message: message,
                }
            }
        })
}

const distinctField = async (fieldName: string) => {
    return await ItemModel.distinct(fieldName)
}

const loadItemComments = async (itemId: string) => {
    if (itemId.match(/^[0-9a-fA-F]{24}$/)) {
        return await ItemModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(itemId)
                }
            }, {
                $lookup: {
                    from: 'users',
                    'let': {
                        id: '$users._id',
                        message: '$comments.message'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        '$comments.userId',
                                        '$$id'
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                comments: 1
                            }
                        }
                    ],
                    localField: 'comments.userId',
                    foreignField: '_id',
                    as: 'users'
                }
            }, {
                $project: {
                    comments: 1,
                    users: 1
                }
            }]
        )
    } else return []
}

const updateItem = async (itemId: string, data: Iitem) => {
    return await ItemModel.updateOne({ _id: itemId }, { $set: data })
}

const deleteItem = async (itemId: string) => {
    return await ItemModel.deleteOne({ _id: new Types.ObjectId(itemId) })
}

const deleteManyItems = async (query: object) => {
    return await ItemModel.deleteMany(query)
}

export default { constructItem, findItemById, addItem, updateItem, deleteItem, findLatestItems, likeItem, commentItem, userLikedItem, loadItemComments, searchItem, distinctField, findItem, deleteManyItems}

