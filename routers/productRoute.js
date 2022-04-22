const router = require('express').Router();
const {productController} = require('../controllers');
const { readToken } = require('../supports/jwt')

router.get('/',productController.getProduct);
router.get('/category',productController.getCategory);
router.get('/satuan',productController.getSatuan);
router.post('/addproduct',readToken, productController.addProduct);
router.delete('/:id',readToken, productController.deleteProduct);
router.patch('/editproduct/:idproduct',readToken, productController.editProduct);
router.patch('/editstock', productController.editStock);

module.exports=router;