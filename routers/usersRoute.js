const router = require('express').Router()
const { usersController } = require('../controllers')
const { readToken } = require('../supports/jwt')

router.get("/", usersController.getData)
router.post("/regis", usersController.register)
router.post("/login", usersController.login)
router.post("/forgot", usersController.forgot)
router.post("/newpassword", readToken, usersController.newPassword)
router.get("/keep", readToken, usersController.keepLogin)
router.get("/verify", readToken, usersController.verification)
router.patch("/changepass", readToken, usersController.changePass)
router.patch("/:iduser", usersController.editProfile)

module.exports = router