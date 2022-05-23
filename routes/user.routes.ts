import { Router, Request, Response } from "express";
import user from '../controllers/user'
const route = Router()

route.get('/checksession', (req: Request, res: Response) => {
    res.status(200).json({ user: req.session.user })
})

route.get('/logout', (req: Request, res: Response, next) => {
    req.session.destroy(function (err) {
        return next((err))
    });
    return res.status(200).send('User logged out')
})

route.get('/users', async (req: Request, res: Response) => {
    const result = await user.findUser({})
    res.status(200).json(result)
})

route.get('/users/:username', async (req: Request, res: Response) => {
    const { username } = req.params
    console.log(req.sessionID)
    const result = await user.userExist({ username: username })
    if (result === null) {
        res.status(404).send("User Not Exist")
    }
    else {
        req.session.lastSearchedUser = result
        res.status(200).json(result)
    }
})

route.get('/like/:itemId', async (req: Request, res: Response) => {
    const { itemId } = req.params
    try {
        const result = await user.likeItem(itemId, req.session.user?._id)
        res.status(200).json(result)
    }
    catch (error) {
        res.status(400).send('Something wend wrong during like operation')
    }
})

route.post('/signin', async (req: Request, res: Response) => {
    const { username, password } = req.body.data
    const result = await user.findUserSignin({ username, password })
    if (!result) return res.status(401).send('Wrong Data')
    else {
        if (result?.status === "blocked") {
            return res.status(401).send("User is blocked")
        }
        else {
            req.session.user = result
            return res.status(200).json(result)
        }
    }
})

route.post('/signup', async (req: Request, res: Response) => {
    const { username, email } = req.body.data
    const result = await user.findUserSingup({ username, email })
    if (result !== null) res.status(401).send('User already exist')
    else {
        const result = await user.createUser(req.body.data)
        req.session.user = result
        return res.status(200).json(result)
    }
})

route.put('/update/:idUser', async (req: Request, res: Response) => {
    const { idUser } = req.params
    if (req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner") {
        await user.updateUser(idUser, req.body.data)
        return res.status(200).send("User successfuly updated")
    }
    else {
        res.status(401).send("User is not authorizated")
    }
})

route.delete('/delete/:idUser', async (req: Request, res: Response) => {
    const { idUser } = req.params
    if (req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner") {
        await user.deleteUser(idUser)
        return res.status(200).send("User successfuly deleted")
    }
    else {
        res.status(401).send("User is not authorizated")
    }
})

export default route