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
            let getStock = await dbQuery(`select st.*,sa.satuan from stock as st join satuan as sa on st.idsatuan = sa.idsatuan;`)
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
            if(req.dataUser.idrole == 1){
                const uploadFile = uploader('/images','IMGPR').array("images",5);
                uploadFile(req,res,async(error)=>{
                    try{
                        console.log("reqbody",req.body.data);
                        console.log("reqfile", req.files);
                        let {idcategory,stock,nama,harga,deskripsi,kemasan,idsatuan,qty,date}=JSON.parse(req.body.data);
                        let insertProduct = await dbQuery(`INSERT INTO product VALUES(null,${idcategory},1,'${nama}',${harga},'${deskripsi}','${kemasan}');`);
                        if(insertProduct.insertId){
                            let inputStock = [];
                            req.files.forEach(async (val) => {
                                await dbQuery(`insert into imageproduct values (null,${insertProduct.insertId},'/images/${val.filename}');`);
                            });
                            stock.forEach((val)=>{
                                inputStock.push(`(null,${insertProduct.insertId},${val.idsatuan},${val.qty},${val.isnetto})`)
                            });
                            await dbQuery(`INSERT INTO indatalog value (null,${insertProduct.insertId},${idsatuan},${qty},'${date}','produk baru');`);
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
    getSatuan: async (req,res)=>{
        try{
            let getSatuan = await dbQuery(`select * from satuan;`)
            res.status(200).send({
                success : true,
                satuan : getSatuan,
                message : 'Get Category Success'
            })
        }
        catch (error) {
            console.log('Get Satuan failed', error)
            res.status(500).send({
                success: failed,
                message : 'Get Satuan error',
                error
            })
        }
    },
    deleteProduct: async (req,res)=>{
        if(req.dataUser.idrole == 1){
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
        }
    },
    editProduct : async (req,res)=>{
        if(req.dataUser.idrole == 1){
            try{
                const uploadFile = uploader('/images','IMGPR').array("images",5);
                uploadFile(req,res,async(error)=>{
                    let {idcategory,stock,nama,harga,deskripsi,kemasan,url}=JSON.parse(req.body.data);
                    console.log('reqfile',req.files)
                    await dbQuery(`update product set idcategory = ${idcategory}, nama = '${nama}', harga=${harga}, deskripsi='${deskripsi}', kemasan='${kemasan}' where idproduct=${req.params.idproduct};`);
                    if(req.files){
                        req.files.forEach(async (val) => {
                            await dbQuery(`update  imageproduct set url='/images/${val.filename}' where idproduct=${req.params.idproduct};`);
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
    },
    editStock: async (req,res)=>{
        try {
            let {stock,qtyIn,idproduct,date}=req.body;
            let qtyTotal;
            if(qtyIn>stock[0].qty){
                console.log('msk sini')
                qtyTotal = stock[2].qty+((Math.abs(qtyIn-stock[0].qty))*10*stock[1].qty);
                await dbQuery(`update stock set qty = ${qtyIn} where idstock=${stock[0].idstock}`)
                await dbQuery(`update stock set qty = ${qtyTotal} where idstock=${stock[2].idstock}`)
            }else if(qtyIn<stock[0].qty){
                qtyTotal = stock[2].qty-((Math.abs(qtyIn-stock[0].qty))*10*stock[1].qty);
                await dbQuery(`update stock set qty = ${qtyIn} where idstock=${stock[0].idstock}`)
                await dbQuery(`update stock set qty = ${qtyTotal} where idstock=${stock[2].idstock}`)
            }
            await dbQuery(`INSERT INTO indatalog value (null,${idproduct},${stock[0].idsatuan},${qtyIn-stock[0].qty},'${date}','Edit Stock');`);
            res.status(200).send({
                message : 'editStock success',
                success : true
            })
        } catch (error) {
            console.log('editStock error', error);
            res.status(500).send({
                message : 'editStock error',
                success : false,
                error
            })
        }
    },
    getDataLogIn: async(req,res)=>{
        try {
            let dataLogIn = await dbQuery(`select d.*,p.nama,i.url,s.satuan from indatalog d join imageproduct i on d.idproduct = i.idproduct join satuan s on d.idsatuan = s.idsatuan join product p on d.idproduct = p.idproduct order by d.idindatalog desc;`);
            res.status(200).send({
                message : 'data Log in berhasil',
                dataLogIn : dataLogIn,
                success : true

            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message : 'error get data log in',
                error :  error,
                success : false
            })
        }
    },
    getDataLogOut: async(req,res)=>{
        try {
            let dataLogOut = await dbQuery(`select d.*,p.nama,i.url,s.satuan from outdatalog d join imageproduct i on d.idproduct = i.idproduct join satuan s on d.idsatuan = s.idsatuan join product p on d.idproduct = p.idproduct order by d.idoutdatalog desc;`);
            res.status(200).send({
                message : 'data Log out berhasil',
                dataLogOut : dataLogOut,
                success : true

            })
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message : 'error get data log out',
                error :  error,
                success : false
            })
        }
    }
}