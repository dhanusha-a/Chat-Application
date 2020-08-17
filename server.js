var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

mongoose.Promise=Promise

var dbUrl = 'mongodb+srv://user:user@learning-node.pkehy.mongodb.net/test?retryWrites=true&w=majority'

//schema
var Message = mongoose.model('Message',{
    name:String,
    message: String
})

app.get('/messages',(req,res)=>{
    Message.find({},(err,messages)=>{
        res.send(messages)
    })    
})

app.get('/messages/:user',(req,res)=>{
    var user = req.params.user
    Message.find({name:user},(err,messages)=>{
        res.send(messages)
    })    
})

app.post('/messages',async(req,res)=>{
    var message = new Message(req.body)     //object from schema
    
    // message.save((err)=>{                   //save to mongo db
    //     if(err)
    //         sendStatus(500)                 //500-server error
        
    //     io.emit('message',req.body)
    //     res.sendStatus(200)
    // })    
//-------------------------------------------------------------------------------
    // var message = new Message(req.body)
    // message.save()
    // .then(()=>{
    //     console.log('saved')
    //     return Message.findOne({message:'badword'})
    // })
    // .then(censored => {
    //     if(censored){
    //         console.log('censored word found',censored)
    //         return Message.remove({_id:censored.id})
    //     }
    //     io.emit('message',req.body)
    //     res.sendStatus(200)        
    // })
    // .catch((err)=>{
    //     res.sendStatus(500) 
    //     return console.error(err)
    // })  
//---------------------------------------------------------------------------------------

    try {
        //throw 'some error'
        var savesMessage = await message.save()
        console.log('saved')

        var censored = await Message.findOne({message:'badword'})
        if(censored)
            await Message.remove({_id:censored.id})
        else
            io.emit('message',req.body)

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500) 
        return console.error(error)
    } finally{
        console.log('message post called')
    }
})

io.on('connection', (socket)=>{
    console.log('user connected')
})

// mongoose.connect(dbUrl, (err)=>{
//     console.log('mongo db connected', err)
// })

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then(()=>{
    console.log('mongodb connected')
})
.catch(err=>console.log(err))


var server = http.listen(3000, () => {
    console.log('server is listening on port ', server.address().port)
})