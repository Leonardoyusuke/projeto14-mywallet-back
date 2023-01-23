import express  from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import joi from "joi";
import { request } from "http";

dotenv.config()
const server = express()
server.use(cors())
server.use(express.json())

const mongoclient = new MongoClient(process.env.DATABASE_URL)
let db
try {
    await mongoclient.connect()
    db=mongoclient.db()
    console.log("foi")
} catch (error) {
    console.log(error)
}




const PORT = 5001

const loginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
})

const newUserSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmpassword: joi.any().valid(joi.ref("password"))
})
//logar
server.post("/login", async (request, response) => {
    const {email, password} = request.body
    const validation = loginSchema.validate(request.body, {abortEarly: false})  
   // if(validation.error) {
     //   const errors = validation.error.details.map((detail) => detail.message);
       // response.sendStatus(422).send(errors)
    //}
    try {
        const userFound = await db.collection("usuarios").findOne({email})
        if (userFound){
            console.log(userFound._id)
            response.send({name:userFound.name,id:userFound._id});
        }
    } catch (error) {
        response.sendStatus(401)
    }
})
//cadastro
server.post("/registro", async (request, response) =>{
    const {name, email, password} = request.body
    const { user } = request.headers 
    const newUserPost = {
        name:name,
        email:email,
        password:password
    }
    const validation = newUserSchema.validate(request.body , {abortEarly:true})
    if(validation.error){
        response.sendStatus(422)
        return 
    }
    try {
        const userExist = await db.collection("usuarios").findOne({email})
        if(userExist){
            return response.sendStatus(409)
        }
    await db.collection("usuarios").insertOne(newUserPost)

    } catch (error) {
        console.log(error)
        return response.sendStatus(400)
    }

} )

server.post("/transacoes", async (request,response) =>{
    const transacao = request.body
    try{
        db.collection('transacoes').insertOne(transacao);
        console.log(transacao)
        response.sendStatus(201);

    }catch(err){
        response.send(err);
    };
}
) 

server.get("/transacoes", async (request,response) =>{ 
    const  {id} = request.body
    console.log(id,"id")
    try{
        const transacoes = await db.collection('transacoes').find({_id:id}).toArray();
        console.log(transacoes,"transacoes")
        response.send(transacoes);


    }catch(err){
        response.send(err);
    };
}
) 

server.listen(PORT, ()  => console.log("servidor rodou "))