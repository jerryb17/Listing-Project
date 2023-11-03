module.exports = (wrapasnyc)=>{
    return (req,res,next)=>{
        wrapasnyc(req,res,next).catch(next);

    }
}