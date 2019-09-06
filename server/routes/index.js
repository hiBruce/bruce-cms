const express = require('express');
const router = express.Router();
const utils = require("../middleware/utils")

router.get("*",(req,res,next)=>{
    if(utils.isHtmlRequest(req)){
        global.renderer(req,res,{url: req.url})
    }else{
        next()
    }
})
module.exports = router