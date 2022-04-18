const axios = require('axios');
const req = require('express/lib/request');

// Config Defaults Axios dengan Detail Akun Rajaongkir
axios.defaults.baseURL = 'https://api.rajaongkir.com/starter'
axios.defaults.headers.common['key'] = '9a4a643f14f30ea1ec13bee8053eb545'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

module.exports = {
    getProvinsi: async (req, res) => {
        try {
            let response = await axios.get('/province')
            res.status(200).send({
                success: true,
                message: 'success get data provinsi',
                dataProvinsi: response.data.rajaongkir.results
            })
        } catch (error) {
            console.log(error)
        }
    },
    getKota: async (req, res) => {
        try {
            let response = await axios.get(`/city?province=${req.params.idProvinsi}`)
            res.status(200).send({
                success: true,
                message: 'success get data kota',
                dataKota: response.data.rajaongkir.results
            })
        } catch (error) {
            console.log(error)
        }
    }
}