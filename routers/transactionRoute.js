const router = require('express').Router();
const {transactionController} = require('../controllers');
const { readToken } = require('../supports/jwt')

router.get('/gettransaction',readToken,transactionController.getTransaction);
router.get('/getadmin',transactionController.getTransactionAdmin);
router.get('/getorderbyresep',readToken,transactionController.getOrderbyresep);
router.get('/getcartresep',transactionController.getCartResep);
router.post('/uploadresep',transactionController.orderbyresep);

router.post('/cost', transactionController.getOngkir)

router.post('/addcartresep',transactionController.addToCartResep);
router.patch('/adminaction/:id',transactionController.adminAction);
router.delete('/deletecartresep/:id', transactionController.deleteCartResep)

module.exports = router;