const express=require("express")
const cors=require("cors")
const app=express()
const router=require("../imports/router")
app.use(cors({exposedHeaders:"x-authToken"}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/user",router.user)
app.use("/activity",router.activity)
app.use("/doneActivity",router.doneActivity)
app.use("/goal",router.goal)



module.exports=app