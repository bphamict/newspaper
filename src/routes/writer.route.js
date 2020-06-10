const router = require('express').Router();
const multer  = require('multer')
const config = require('../configs/default')
const storage = multer.diskStorage(config.multerImagePost)
const upload = multer({storage:storage})


router.get('/add/post', (req, res) => {
    res.render('writer/add-post')
})

router.post('/image', upload.single('file'), (req, res) => {
    res.json({ location: `/public/images/post/${req.file.filename}` })
})

module.exports = router;