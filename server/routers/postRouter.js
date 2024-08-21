const router = require('express').Router();
const postCntrls = require('../controllers/postCntrls')
const requireUser = require('../middlewares/requireUser')

// router.get('/all', requireUser,postCntrls.getAllPostController);
router.post('/', requireUser,postCntrls.creatPostController);
router.post('/like', requireUser,postCntrls.likeAndUnlike);
router.put('/',requireUser,postCntrls.updatePost);
router.delete('/',requireUser,postCntrls.deletePost);
module.exports = router;