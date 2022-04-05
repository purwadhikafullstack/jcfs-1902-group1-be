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
    }
}