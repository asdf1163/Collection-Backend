import { Response, Request, Router } from "express";
const router = Router();
import collection from '../controllers/collection'

router.get('/', function (req: Request, res: Response) {
    res.send('hello');
})

router.get('/largestCollection', async (req: Request, res: Response) => {
    const result = await collection.largestCollection()
    res.status(200).json(result);
})

router.get('/find/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params
    const result = await collection.findCollection(userId)
    if (result.length === 0) return res.status(404).send("User doesn't have any collection")
    return res.status(200).json(result)
})

router.post('/findItemsInCollection', async (req: Request, res: Response) => {
    const [result] = await collection.findItemsInCollection(req.body.data.collectionId)
    const items = result.items
    delete result.items
    const collectionData = result
    res.status(200).json({ items, collectionData });
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