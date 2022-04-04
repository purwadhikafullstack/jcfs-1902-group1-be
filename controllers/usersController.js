const { db, dbQuery } = require('../supports/database');
const { hashPassword, createToken } = require('../supports/jwt');
const { transporter } = require('../supports/nodemailer');

module.exports = {
    getData: (req, res, next) => {
        dbQuery(`SELECT * FROM user`,
            (err, results) => {
                if (err) {
                    console.log(err)
                    res.status(400).send(err)
                };
                res.status(200).send(results)
            })
    },
    register: async (req, res) => {
        try {
            let { idrole, idstatus, email, username, password, phone, profile_image } = req.body
            let insertSQL = `INSERT INTO user (iduser, idrole, idstatus, email, username, password, phone, profile_image) VALUES
                (null,
                ${idrole},
                ${idstatus},
                ${db.escape(email)},
                ${db.escape(username)},
                ${db.escape(hashPassword(password))},
                ${db.escape(phone)},
                ${db.escape(profile_image)});`

            let getSQL = `SELECT * FROM user WHERE email=${db.escape(email)};`
            let checkEmail = await dbQuery(getSQL);
            if (checkEmail.length > 0) {
                res.status(400).send({
                    success: true,
                    message: "Email Exist ⚠",
                    error: ""
                });
            } else {
                let insertUser = await dbQuery(insertSQL);
                if (insertUser.insertId) {
                    let getUser = await dbQuery(`SELECT * FROM user WHERE iduser=${insertUser.insertId};`)
                    let { iduser, username, email, role, status } = getUser[0];
                    let token = createToken({ iduser, username, email, role, status })
                    await transporter.sendMail({
                        from: "Admin Pharma",
                        to: "reyhanbalthazarepsa@gmail.com",
                        subject: "Confirm Registration",
                        html: `<div>
                        <h3>Klik Link dibawah ini untuk verifikasi akun anda</h3>
                        <a href='http://localhost:3000/verification/${token}'>Click, Here</a>
                        </div>`
                    })
                    res.status(200).send({
                        success: true,
                        message: "Register Succes ✅",
                        error: ""
                    })
                }
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: true,
                message: "Failed ❌",
                error: ""
            });
        }
    },
    login: (req, res) => {
        let { email, password } = req.body
        let loginScript = `SELECT * FROM user WHERE email=${db.escape(email)} AND password=${db.escape(hashPassword(password))};`
        db.query(loginScript, (err, results) => {
            if (err) {
                console.log(err)
                res.status(500).send({
                    success: true,
                    message: "Failed ❌",
                    error: err
                })
            };

            if (results.length > 0) {
                let { iduser, idrole, idstatus, email, username, password, phone, profile_image } = results[0]
                let token = createToken({ iduser, idrole, idstatus, email, username })
                res.status(200).send({
                    success: true,
                    message: "Login Success ✅",
                    dataLogin: { iduser, idrole, idstatus, email, username, password, phone, profile_image, token }
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "Login Failed ❌",
                    dataLogin: {},
                    error: ""
                })
            }
        })
    },
    keepLogin: (req, res) => {
        console.log("req.dataUser keepLogin ", req.dataUser)
        let keepLoginScript = `SELECT * FROM user WHERE iduser=${db.escape(req.dataUser.iduser)};`
        db.query(keepLoginScript, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: err
                })
            };
            console.log("results = ", results[0])
            if (results.length > 0) {
                let { iduser, username, email, password, idrole, idstatus } = results[0]
                let token = createToken({ iduser, username, email, idrole, idstatus })
                res.status(200).send({
                    success: true,
                    message: "Login Success ✅",
                    dataLogin: { iduser, username, email, idrole, idstatus, token, password,  },
                    error: ""
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "Login Failed ❌",
                    dataLogin: {},
                    error: ""
                })
            }
        })
    },
    verification: async (req, res) => {
        try {
            if (req.dataUser.iduser) {
                await dbQuery(`UPDATE user SET idstatus=2 WHERE iduser=${db.escape(req.dataUser.iduser)};`);
                let login = await dbQuery(`SELECT * FROM user WHERE iduser=${db.escape(req.dataUser.iduser)};`);
                if (login.length > 0) {
                    let { iduser, username, email, password, role, status } = login[0];
                    let token = createToken({ iduser, username, email, role, status });
                    res.status(200).send({
                        success: true,
                        message: "Login Success ✅",
                        dataVerify: { username, email, role, status, token },
                        error: ""
                    })
                }
            } else {
                res.status(401).send({
                    success: false,
                    message: "Verify Failed ❌",
                    dataVerify: {},
                    err: ''
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Verify Failed :x:",
                err: ''
            })
        }
    },
    changePass: async (req, res) => {
        try {
            await dbQuery(`UPDATE user SET password=${db.escape(hashPassword(req.body.newPassword))} WHERE iduser=${db.escape(req.dataUser.iduser)};`);
            res.status(200).send({
                success: true,
                message: "Change Password Success ✅",
                error: ""
            })
        } catch (error) {
            console.log(error)
            res.status(401).send({
                success: false,
                message: "Change Password Failed ❌",
                dataVerify: {},
                err: ''
            })
        }
    },
    forgot: async (req, res) => {
        try {
            console.log("req.body.email ", req.body)
            let getSQL = await dbQuery(`SELECT * FROM user WHERE email=${db.escape(req.body.email)};`)
            let { iduser, idrole, idstatus, username, email } = getSQL[0]
            let token = createToken({ iduser, idrole, idstatus, username, email })
            console.log("getSQL ", getSQL[0])
            await transporter.sendMail({
                from: "Admin Pharma",
                to: "reyhanbalthazarepsa@gmail.com",
                subject: "Reset Password",
                html: `<div>
                        <h3>Klik Link dibawah ini untuk Reset Password anda</h3>
                        <a href='http://localhost:3000/resetpassword/${token}'>Click, Here to Reset Password</a>
                        </div>`
            })
            res.status(200).send({
                success: true,
                message: "Send Success ✅",
                error: ""
            })
        } catch (error) {
            console.log(error)
            res.status(400).send({
                success: true,
                message: "Email not Exist ❌",
                error: ""
            });
        }
    },
    newPassword: async (req, res) => {
        console.log("req.dataUser newPassword ", req.dataUser)
        try {
            if (req.dataUser.iduser) {
                await dbQuery(`UPDATE user SET password=${db.escape(hashPassword(req.body.password))} WHERE iduser=${req.dataUser.iduser}`)
                let login = await dbQuery(`SELECT * FROM user WHERE iduser=${db.escape(req.dataUser.iduser)};`);
                if (login.length > 0) {
                    let { iduser, username, email, password, idrole, idstatus } = login[0];
                    let token = createToken({ iduser, username, email, idrole, idstatus });
                    res.status(200).send({
                        success: true,
                        message: "Update Success ✅",
                        dataReset: { username, email, idrole, idstatus, iduser, token },
                        error: ""
                    })
                }
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Change Password Failed ❌",
                err: ''
            })
        }
    }
}