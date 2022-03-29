const multer = require('multer');
const fs = require('fs');

module.exports = {
    uploader: (directory, fileNamePrefix)=>{
        let defaultDir = './public';
        const storage = multer.diskStorage({
            destination:(req,file,cb)=>{
                const pathDir = directory ? defaultDir + directory : defaultDir;
                if(fs.existsSync(pathDir)){
                    console.log(`Directory ${pathDir} exist`);
                    cb(null,pathDir);
                }else{
                    fs.mkdir(pathDir,{recursive:true},(err)=>cb(err,pathDir));
                    console.log(`Directory created ${pathDir}`);
                }
            },
            filename:(req,file,cb)=>{
                let ext = file.originalname.split('.');
                let fileName = fileNamePrefix + Date.now() + '.' + ext[ext.length-1];
                console.log('File Name Baru', fileName);
                cb(null,fileName);
            }
        });
        const fileFilter=(req,file,cb)=>{
            const extFilter = /\.(jpg|png|jpeg|webp)/
            if(file.originalname.toLowerCase().match(extFilter)){
                return cb(null,true);
            }else{
                return cb(new Error('your file denied'), false)
            }
        }
        return multer({storage,fileFilter});
    }
}