const router = require('express').Router();
const {transactionController} = require('../controllers');
const { readToken } = require('../supports/jwt')

router.get('/gettransaction',readToken,transactionController.getTransaction);
router.post('/uploadresep',transactionController.orderbyresep);
router.post('/cost', transactionController.getOngkir)

module.exports = router;