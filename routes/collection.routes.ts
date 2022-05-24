import { Response, Request, Router } from "express";
const router = Router();
import collection from '../controllers/collection'
import item from "../controllers/item";

router.get('/', function (req: Request, res: Response) {
    res.send('hello');
})

router.get('/largestCollection', async (req: Request, res: Response) => {
    const result = await collection.largestCollection()
    res.status(200).json(result);
})

router.get('/find/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params
    try {
        const result = await collection.findCollection(userId)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get('/findItemsInCollection/:collectionId', async (req: Request, res: Response) => {
    const [result] = await collection.findItemsInCollection(req.params.collectionId)
    if (result) {
        const items = result.items
        const users = result.users
        delete result.items
        const collectionData = result
        res.status(200).json({ items, collectionData, users });
    }
    else
        res.status(404).json({ items: [], collectionData: [], users: [] });
})


router.put('/edit/:collectionId', async (req: Request, res: Response, next) => {
    const { collectionId } = req.params

    if (!(req.session.user?._id === req.session.lastSearchedUser?._id || req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner")) {
        return res.status(401).send('User is not authorized')
    }
    try {
        await collection.updateCollection(collectionId, req.body.data)
        return res.status(204).send('Resource updated successfuly')
    }
    catch (error) {
        return res.status(400).send('Something went wrong during editing')
    }
}
)

router.delete('/delete/:collectionId', async (req: Request, res: Response) => {
    const { collectionId } = req.params
    if (!(req.session.user?._id === req.session.lastSearchedUser?._id || req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner"))
        return res.status(401).send('User is not authorized')
    try {
        await item.deleteManyItems({ collectionId: collectionId })
        await collection.deleteCollection(collectionId)
        res.status(204).send('Collection successfuly deleted')
    } catch (error) {
        res.send(400).send("Something went wrong during deleting")
    }
})

router.post('/create', async function (req: Request, res: Response) {
    if (!(req.session.user?._id === req.session.lastSearchedUser?._id || req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner"))
        return res.status(401).send('User is not authorized')
    Object.assign(req.body.data, { idUser: req.session.lastSearchedUser?._id })
    const result = await collection.createCollection(req.body.data)
    res.status(200).json(result)
})

export default router