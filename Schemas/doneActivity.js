const doneActivity={
    date:{
        type:String,
        required:"date Required"
    },
    startTime:{
        type:String,
        required:" startTime Required"
    },
    endTime:{
        type:String,
        required:"endTime Required"
    },
    note:{
        type:String,
        required:"note Required"
    },
    emotion:{
        type:Number,
        required:"emotion Required"
    },
    relatedGoals:{
        type:[],
        default:[],
        validate:{
            validator:(v)=>{
                if(v.length<1){
                    throw new Error("Select one or more goal.")
                }
            }
        }
    }
}
module.exports= doneActivity