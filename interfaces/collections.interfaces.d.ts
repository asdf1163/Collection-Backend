export interface Icollection {
    _id: any,
    idUser: string,
    name: string,
    description: string,
    topic: string,
    tags: string[],
    additional: {
        name: string,
        value: 'number' | 'text' | 'checkbox' | 'date' | 'textarea'
    }[],
    linkImg: string,
    creationDate: Date,
    items?: Iitem[]
}

export interface Iitem {
    _id: any,
    name: string,
    collectionId: string,
    tags: string | string[],
    linkImg?: string,
    additional: {
        _id?: string,
        name: string,
        value: any
    },
    ownerId: any,
    creationDate: Date,
    likes: any[],
    comments: {
        userId?: string,
        message: string,
    }
}