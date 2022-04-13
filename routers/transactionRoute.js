const router = require('express').Router();
const {transactionController} = require('../controllers');
const { readToken } = require('../supports/jwt')

router.get('/gettransaction',readToken,transactionController.getTransaction);
router.get('/getadmin',transactionController.getTransactionAdmin);
router.post('/uploadresep',transactionController.orderbyresep);
router.patch('/adminaction/:id',transactionController.adminAction);

module.exports = router;