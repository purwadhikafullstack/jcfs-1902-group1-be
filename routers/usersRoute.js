const router = require('express').Router()
const { usersController } = require('../controllers')
const { readToken } = require('../supports/jwt')

router.get("/", usersController.getData)
router.get("/getaddress", readToken, usersController.getAddress)
router.post("/regis", usersController.register)
router.post("/login", usersController.login)
router.post("/forgot", usersController.forgot)
router.post("/newpassword", readToken, usersController.newPassword)
router.get("/keep", readToken, usersController.keepLogin)
router.get("/verify", readToken, usersController.verification)
router.patch("/changepass", readToken, usersController.changePass)
router.patch("/:iduser", readToken, usersController.editProfile)
router.post("/newaddress", usersController.newAddress)
router.delete("/:id", readToken, usersController.deleteAddress)
router.patch("/address/:id", readToken, usersController.chooseAddress)
router.post("/addtocart", readToken, usersController.addToCart)
router.get("/getcart", readToken, usersController.getCart)
router.patch("/cart/:id", usersController.deleteCart)
// OPSI LAIN
router.patch("/pluscart/:id", usersController.plusQtyCart)
router.patch("/minuscart/:id", usersController.minusQtyCart)
// OPSI LAIN

module.exports = router