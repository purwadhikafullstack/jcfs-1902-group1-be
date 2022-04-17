const router = require('express').Router()
const { rajaOngkirController } = require('../controllers')

router.get('/provinsi', rajaOngkirController.getProvinsi)
router.get('/kota/:idProvinsi', rajaOngkirController.getKota)

module.exports = router