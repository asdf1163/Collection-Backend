import { Response, Request, Router } from "express";
const router = Router();
import item from '../controllers/item';

router.get('/', function (req: Request, res: Response) {
    res.send('hello');
})

router.get('/latestItems', async (req: Request, res: Response) => {
    const result = await item.findLatestItems()
    res.status(200).json(result)
})

router.get('/search', async (req: Request, res: Response) => {
    try {
        const resultItems = await item.searchItem(req.query.q as string)
        return res.status(200).json(resultItems)
    } catch (error) {
        console.error(error)
        res.status(400).send("Something went wrong with searching a result")
    }
})

router.get('/like/:itemId', async (req: Request, res: Response) => {
    const { itemId } = req.params
    try {
        if (!itemId || !req.session.user?._id) {
            return res.status(401).send('User is not logged in')
        }
        const result = await item.likeItem(itemId, req.session.user?._id)
        res.status(200).json(result)
    }
    catch (error) {
        console.error(error)
        res.status(400).send('Something went wrong during like operation')
    }
})

router.get('/find/:itemId', async (req: Request, res: Response) => {
    const { itemId } = req.params
    const itemData = await item.findItem(itemId)
    const like = await item.userLikedItem(itemId, req.session.user?._id)
    const comments = await item.loadItemComments(itemId)
    if (itemData.length)
        return res.status(200).json({ item: itemData, like: !like, comments: comments })
    else
        return res.status(200).json({ item: [], like: false, comments: [] })
})

router.post('/comments/:itemId', async (req: Request, res: Response) => {
    const { itemId } = req.params
    const { message } = req.body.data
    try {
        if (!itemId || !req.session.user?._id) {
            return res.status(401).send('User is not authorized')
        }
        if (!message) {
            return res.status(400).send('Message is empty')
        }
        const result = await item.commentItem(itemId, req.session.user?._id, message)
        res.status(200).json(result)
    }
    catch (error) {
        res.status(400).send('Something went wrong during comment operation')
    }
})

router.post('/create', async (req: Request, res: Response) => {
    if (!(req.session.user?._id === req.session.lastSearchedUser?._id.valueOf() || req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner")) {
        return res.status(401).send('User is not authorized')
    }
    const result = await item.addItem(req.body.data)
    res.status(200).json(result)
})

router.post('/comment/:itemId', async (req: Request, res: Response) => {
    const { itemId } = req.params
    const { comment } = req.body.data
    try {
        const result = await item.commentItem(itemId, req.session.user?._id, comment)
        res.status(200).json(result)
    }
    catch (error) {
        res.status(400).send('Something wend wrong during like operation')
    }

})

router.put('/edit/:itemId', async (req: Request, res: Response) => {
    const { itemId } = req.params
    if (!(req.session.user?._id === req.session.lastSearchedUser?._id || req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner")) {
        return res.status(401).send('User is not authorized')
    }
    try {
        const result = await item.updateItem(itemId, req.body.data)
        return res.status(204).json(result)
    }
    catch (error) {
        return res.status(400).send('Something went wrong during editing item')
    }
})

router.delete('/delete/:itemId', async (req: Request, res: Response) => {
    const { itemId } = req.params
    if (!(req.session.user?._id === req.session.lastSearchedUser?._id || req.session.user?.privilage === "admin" || req.session.user?.privilage === "owner")) {
        return res.status(401).send('User is not authorized')
    }
    try {
        const result = await item.deleteItem(itemId)
        res.status(204).send('Item successfuly deleted')
    } catch (error) {
        res.status(400).send('Something went wrong during deleting item')
    }
})

export default router