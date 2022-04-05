const router = require('express').Router();
const {transactionController} = require('../controllers');
const { readToken } = require('../supports/jwt')

router.post('/uploadresep',transactionController.orderbyresep);

module.exports = router;