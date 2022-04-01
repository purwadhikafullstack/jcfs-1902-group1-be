const {db,dbQuery} = require('../supports/database');
const fs = require('fs');
const {uploader} = require('../supports/uploader');

module.exports = {
    getProduct: async (req,res)=>{
        try{
            let filterQuery = [];
            for(let prop in req.query){
                if(prop != 'sort' && prop != 'order'){
                    filterQuery.push(
                        `${prop == "nama" || "idproduct" ? `p.${prop} like '%${req.query[prop]}%'` : `${prop}=${db.escape(req.query[prop])}`}`
                    );
                }    
            }
            console.log('query', filterQuery)
            console.log('query', req.query.sort)
            let {sort, order} = req.query;
            let getProduct = await dbQuery(`select p.* , i.url as url,c.category as category from product p join imageproduct i on p.idproduct = i.idproduct join category c on p.idcategory=c.idcategory where idstatus = 1 ${filterQuery.length>0? `and ${filterQuery.join(" and ")}`: ''} ${sort&&order? `order by ${sort} ${order}`:''};`);
            console.log('query',getProduct)
            let getStock = await dbQuery(`select * from stock;`)
            getProduct.forEach(valPro=>{
                valPro.stock = [];
                getStock.forEach(valStk=>{
                    if(valPro.idproduct == valStk.idproduct){
                        delete valStk.idproduct;
                        valPro.stock.push(valStk);
                    }
                })
            })
            res.status(200).send({
                success : true,
                dataProduct : getProduct
            })
        }
        catch(error){
            console.log('error get product',error);
            res.status(500).send({
                message : 'get product error',
                success : false,
                error
            })
        }
    },
    addProduct: async (req,res)=>{
        try{
            const uploadFile = uploader('/images','IMGPR').array("images",5);
            uploadFile(req,res,async(error)=>{
                try{
                    console.log("reqbody",req.body.data);
                    console.log("reqfile", req.files);
                    let {idcategory,stock,nama,harga,deskripsi,kemasan}=JSON.parse(req.body.data);
                    let insertProduct = await dbQuery(`INSERT INTO product VALUES(null,${idcategory},1,'${nama}',${harga},'${deskripsi}','${kemasan}');`);
                    if(insertProduct.insertId){
                        let inputStock = [];
                        req.files.forEach(async (val) => {
                            await dbQuery(`insert into imageproduct values (null,${insertProduct.insertId},'http://localhost:2001/images/${val.filename}');`);
                        });
                        stock.forEach((val)=>{
                            inputStock.push(`(null,${insertProduct.insertId},'${val.satuan}',${val.qty});`)
                        });
                        await dbQuery(`insert into stock values ${inputStock.join()};`);
                    }
                    res.status(200).send({
                        success : true, 
                        message:"Add Product Success"
                    })
                }
                catch (error){
                    console.log('add product error 1',error);
                    res.status(500).send({
                        success : false,
                        message: 'failed',
                        error
                    })     
                }
            })
        }
        catch(error){
            console.log('add product error',error);
            res.status(500).send({
                success : false,
                message: 'failed',
                error
            })
        }
    },
    getCategory: async (req,res)=>{
        try{
            let getCategory = await dbQuery(`select * from category;`)
            res.status(200).send({
                success : true,
                category : getCategory,
                message : 'Get Category Success'
            })
        }
        catch (error) {
            console.log('Get Category failed', error)
            res.status(500).send({
                success: failed,
                message : 'Get Category error',
                error
            })
        }
    },
    deleteProduct: async (req,res)=>{
        try{
            await dbQuery(`update product set idstatus = 2 where idproduct=${req.params.id};`)
            res.status(200).send({
                message : 'Delete Success',
                success : true,
            })

        }
        catch(error){
            console.log('error delete product',error);
            res.status(500).send({
                message : 'Delete Error',
                success : false,
                error
            })
        }
    },
    editProduct : async (req,res)=>{
        try{
            const uploadFile = uploader('/images','IMGPR').array("images",5);
            uploadFile(req,res,async(error)=>{
                let {idcategory,stock,nama,harga,deskripsi,kemasan,url}=JSON.parse(req.body.data);
                console.log('reqfile',req.files)
                await dbQuery(`update product set idcategory = ${idcategory}, nama = '${nama}', harga=${harga}, deskripsi='${deskripsi}', kemasan='${kemasan}' where idproduct=${req.params.idproduct};`);
                stock.forEach(async (val)=>{
                    await dbQuery(`update ecommerce.stocks set satuan='${val.satuan}',qty=${val.qty} where idstocks=${val.idstocks};`);
                });     
                    if(req.files){
                        req.files.forEach(async (val) => {
                            await dbQuery(`update  imageproduct set url='http://localhost:2001/images/${val.filename}' where idproduct=${req.params.idproduct};`);
                            });
                        }else{
                            await dbQuery(`update  imageproduct set url='${url}' where idproduct=${req.params.idproduct};`);
                    }
            res.status(200).send({
                    message : 'Edit Product Success',
                    error
                })
            })
        }catch(error){
            console.log('error edit product : ', error);
            res.status(500).send({
                message : 'error edit',
                success : false,
                error
            })
        }
    }
}