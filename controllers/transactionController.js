const {db,dbQuery} = require('../supports/database');
const fs = require('fs');
const {uploader} = require('../supports/uploader');

module.exports={
    orderbyresep : async (req,res)=>{
        try{
            const uploadFile = uploader('/images','IMGPR').array('images',5);
            uploadFile(req,res,async(error)=>{
                try{
                    let {iduser,invoice,date} = JSON.parse(req.body.data);
                    let {filename} = req.files[0];
                    console.log('filename',filename)
                    await dbQuery(`insert into orderbyresep values (null,${iduser},'/images/${filename}','${invoice}',8,'${date}');`);
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
            let {idstatus} = req.query;
            let dataTransaction = await dbQuery(`SELECT t.*,u.username ,a.address as address, s.status FROM transaction t join user u on t.iduser=u.iduser join status s on t.idstatus=s.idstatus join address a on t.idaddress = a.idaddress ${idrole == 2 ? `where t.iduser = ${iduser}` : ''} ${idstatus == 6 ? `and t.idstatus = 6` : `and not t.idstatus = 6 ` };`);
            console.log('getransaction', dataTransaction);
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
                dataTransaksi : dataTransaction
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
    },
    getTransactionAdmin : async (req,res)=>{
        try{
            let filterQuery = [];
            for(let prop in req.query){
                filterQuery.push(`${prop == 'username' || prop == 'invoice' ? `${prop} like '%${req.query[prop]}%'` : prop=='idstatus' ? `t.idstatus=${req.query[prop]}`:`${prop}=${db.escape(req.query[prop])}`}`);
            }
            let dataTransaction = await dbQuery(`SELECT t.*,u.username ,a.address as address, s.status FROM transaction t join user u on t.iduser=u.iduser join status s on t.idstatus=s.idstatus join address a on t.idaddress = a.idaddress ${filterQuery.length>0? `where ${filterQuery.join(" and ")}`: ''};`);
            let dataDetail = await dbQuery(`select d.*,p.nama,p.harga as harga_persatuan,i.url from detailtransaction d join product p on d.idproduct = p.idproduct join imageproduct i on p.idproduct = i.idproduct;`)
            dataTransaction.forEach((val)=>{
                val.detail = [];
                dataDetail.forEach((value)=>{
                    if(val.idtransaction == value.idtransaction){
                        val.detail.push(value);
                    }
                })
            })
            // console.log('query', dataTransaction);
            res.status(200).send({
                message : "data transaction admin success",
                success : true,
                dataTransaksiAdmin : dataTransaction
            })
        }
        catch (error){
            console.log('get transaction admin error', error);
            res.status(500).send({
                message : 'Get transactions Error',
                success : failed,
                error
            })
        }
    },
    adminAction: async (req,res)=>{
        try {
            await dbQuery(`update transaction set idstatus=${req.body.idstatus} where idtransaction=${req.params.id};`);
            res.status(200).send({
                success: true,
                message : 'admin action success'
            })
        } catch (error) {
            console.log('admin action error', error);
            res.status(500).send({
                success : false,
                message: 'admin action failed',
                error
            })
        }
    },
    getOrderbyresep : async (req,res)=>{
        try{
            let {idrole,iduser} = req.dataUser;
            let {idorder} = req.query;
            let getOrderbyresep = await dbQuery(`SELECT o.*, s.status,u.* from orderbyresep o join status s on o.idstatus=s.idstatus join user u on o.iduser=u.iduser ${idrole==2? `where o.iduser=${iduser} and o.idstatus=8` : `${idorder?`where idorder=${idorder}`:''}`};`);
            res.status(200).send({
                message : 'Get order by resep sukses',
                success : true,
                dataGetOrder : getOrderbyresep
            })
        }
        catch (error){
            console.log('error get order by resep', error);
            res.status(500).send({
                message : 'order by resep error',
                success : false,
                error
            })
        }
    },
    addToCartResep : async (req,res)=>{
        try {
            let {idorder,iduser,idproduct,qty,idsatuan,hargaperproduct} = req.body;
            await dbQuery(`insert into cartresep values (null,${idorder},${iduser},${idproduct},${qty},${idsatuan},${hargaperproduct});`);
            res.status(200).send({
                message : 'add to cartresep berhasil',
                success : true,
                error :""
            })
        } catch (error) {
            console.log('error add cart resep',error);
            res.status(500).send({
                message : 'add to cart resep error',
                success : true,
                error
            })
        }
    },
    getCartResep : async (req,res)=>{
        try {
            let getCart = await dbQuery(`select c.*,p.*,i.url,s.satuan from cartresep c join product p on c.idproduct=p.idproduct join imageproduct i on c.idproduct = i.idproduct join satuan s on c.idsatuan = s.idsatuan where c.idorder = ${req.query.idorder};`);
            let getStock = await dbQuery(`SELECT s.*, c.idproduct,c.idcartresep FROM stock s JOIN cartresep c ON s.idproduct=c.idproduct;`)
            // console.log('stock',getStock)
            getCart.forEach(async (value, index) => {
                value.stock = [];
                getStock.forEach((val, idx) => {
                    if (value.idcartresep == val.idcartresep) {
                        value.stock.push(val)
                    }
                })
            })
            res.status(200).send({
                message : 'get cart resep success',
                success : true,
                error : '',
                dataCartResep : getCart
            })
        } catch (error) {
            console.log('getcart resep error', error);
            res.status(500).send({
                message : 'get cart resep error',
                success : failed,
                error
            })
        }
    },
    deleteCartResep: async (req,res)=>{
        try {
            await dbQuery(`delete from cartresep where idcartresep = ${req.params.id} `);
            res.status(200).send({
                message:'delete cart resep sukses',
                success : true
            })           
        } catch (error) {
            console.log('error delete cart',error)
            res.status(500).send({
                message:'error delete cart',
                success : false
            })
        }
    },
    checkoutResep: async(req,res)=>{
        try {
            let { iduser, idaddress, invoice, date, shipping, tax, totalpembayaran, detail,idorder } = req.body
            let insertTransactionSQL = await dbQuery(`INSERT INTO transaction VALUE (null, ${iduser}, ${idaddress}, 4, ${db.escape(invoice)}, ${db.escape(date)}, ${shipping}, ${tax}, ${totalpembayaran}, "0");`)
            if (insertTransactionSQL.insertId) {
                detail.forEach(async (value) => {
                    await dbQuery(`INSERT INTO detailtransaction VALUE (null, ${insertTransactionSQL.insertId}, ${value.idproduct}, ${value.qty}, ${value.harga * value.qty})`)
                })
            }
            let qtyStock;
            let qtyTotal;
            // update stock saat checkout by admin
            detail.forEach(async(val,idx)=>{
                let {stock}=val;
                //pengkondisian saat qty stock dengan satuan terkecil (mg)
                if(val.idsatuan==3 || val.idsatuan==4){
                    qtyTotal = stock[2].qty-val.qty
                    await dbQuery(`update stock set qty=${qtyTotal} where idstock=${stock[2].idstock}`)
                    if(val.qty <= stock[1].qty*10){
                        qtyStock=stock[0].qty-1
                    }else{
                        qtyStock=stock[0].qty-(val.qty/(stock[1].qty*10))
                    }
                    await dbQuery(`update stock set qty=${qtyStock} where idstock=${stock[0].idstock}`)
                }else{
                    qtyStock=stock[0].qty-val.qty;
                    qtyTotal = qtyStock*stock[2].qty;
                    await dbQuery(`update stock set qty=${qtyTotal} where idstock=${stock[2].idstock}`)
                    await dbQuery(`update stock set qty=${qtyStock} where idstock=${stock[0].idstock}`)
                }
            })
            await dbQuery(`Update orderbyresep set idstatus = 4 where idorder = ${idorder};`)
            await dbQuery(`DELETE FROM cartresep WHERE idorder = ${idorder}`)
            res.status(200).send({
                success: true,
                message: "Add Transaction Success"
            })
        } catch (error) {
            console.log('checkout error 1', error);
            res.status(500).send({
                success: false,
                message: 'failed',
                error
            })
        }
    }
}