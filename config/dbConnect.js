const { default: mongoose } = require("mongoose")

const dbConnect = () =>{
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL)
        console.log("Connect success")
    }catch(err){
        console.log("Error connecting")
    }
}
module.exports = dbConnect;