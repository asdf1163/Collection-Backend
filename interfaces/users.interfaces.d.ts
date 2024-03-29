
export interface IuserSchema {
    _id: any,
    username: string,
    password?: string,
    email: string,
    status: 'blocked' | 'unlocked',
    privilage: 'owner' | 'admin' | 'user' | 'guest',
}

export interface IuserPost {
    username: string,
    password: string,
    email?: string
}
