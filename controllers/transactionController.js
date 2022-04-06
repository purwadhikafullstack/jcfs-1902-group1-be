const {db,dbQuery} = require('../supports/database');
const fs = require('fs');
const {uploader} = require('../supports/uploader');

module.exports={
    orderbyresep : async (req,res)=>{
        try{
            const uploadFile = uploader('/images','IMGPR').array('images',5);
            uploadFile(req,res,async(error)=>{
                try{
                    let {iduser,invoice} = JSON.parse(req.body.data);
                    let {filename} = req.files[0];
                    console.log('filename',filename)
                    await dbQuery(`insert into orderbyresep values (null,${iduser},'/images/${filename}','${invoice}',3);`);
                    res.status(200).send({
                        success : true,
                        message : "upload success",
                        error :''
                    })
                }
                catch (error){
                    res.status(500).send({
                        success : false,
                        message : 'upload resep failed',
                        error
                    })
                }
            })

        }
        catch (error){
            console.log('error upload resep', error)
            res.status(500).send({
                success : false,
                message : 'upload resep failed',
                error
            })
        }
    },
    getTransaction : async (req,res)=>{
        try{
            let {iduser,idrole} = req.dataUser;
            let dataTransaction = await dbQuery(`SELECT t.*,a.address as address FROM transaction t join address a on t.idaddress = a.idaddress ${idrole == 2 ? `where iduser = ${iduser}` : ''};`);
            let dataDetail = await dbQuery(`select d.*,p.nama,p.harga as harga_persatuan,i.url from detailtransaction d join product p on d.idproduct = p.idproduct join imageproduct i on p.idproduct = i.idproduct;`)
            dataTransaction.forEach((val)=>{
                val.detail = [];
                dataDetail.forEach((value)=>{
                    if(val.idtransaction == value.idtransaction){
                        val.detail.push(value);
                    }
                })
            })
            res.status(200).send({
                message : "data transaction success",
                success : true,
                data : dataTransaction
            })
        }
        catch (error){
            console.log(error);
            res.status(500).send({
                message : "error get transaction",
                success : false,
                error
            })
        }
    }
}