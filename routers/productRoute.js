const router = require('express').Router();
const {productController} = require('../controllers');
const { readToken } = require('../supports/jwt')

router.get('/',productController.getProduct);
router.get('/category',productController.getCategory);
router.post('/addproduct',readToken, productController.addProduct);
router.delete('/:id',readToken, productController.deleteProduct);
router.patch('/:idproduct',readToken, productController.editProduct);

module.exports=router;