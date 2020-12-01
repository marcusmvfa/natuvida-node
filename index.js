const express = require('express');
const bodyParser = require('body-parser');
const smartphone = require('./routes/smartphonesRoutes'); // Importa rota
const app = express();
const {MongoClient} = require('mongodb');
app.use('/smartphones', smartphone);
var db ={};
const uri = 'mongodb+srv://admin:9844@clusternatuvida.v83d2.mongodb.net/natuvida-mongo?retryWrites=true&w=majority';
// var ObjectId = require('mongodb').ObjectID;
// const client = MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect((err, client) => {
//     if (err)
//         console.log("deu eroo!!!!: " + err);
//     db = client.db("natuvida-mongo");
//     // perform actions on the collection object
//     app.listen(3000, function () {
//         console.log("server running on port 3000");
//     });
//     //client.close();
// });
const client = new MongoClient(uri);
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Express server listening on port %d in %s mode", process.env.PORT, app.settings.env);
    client.connect();
});

async function listUsers(){
    try {
        
        return await client.db('natuvida-mongo').collection('users').find({}).toArray()
    } catch(err){
        console.log(err);
    } finally{
        // await client.close();
    }
};

async function listPostagens(){
    try {
        
        return await client.db('natuvida-mongo').collection('postagens').find({}).toArray()
    } catch(err){
        console.log(err);
    } finally{
        // await client.close();
    }
};

async function getUsers(req, res, next) {
    try {
        let users = await listUsers()
        console.log('### USERS ###')
        console.log(users)
        res.json(users)
    } catch (exception) {
        console.log('@@@')
        console.log(exception)
        next(exception)
    }
}
async function getPostagens(req, res, next) {
    try {
        let users = await listUsers()
        console.log('### Posts ###')
        console.log(users)
        res.json(users)
    } catch (exception) {
        console.log('@@@')
        console.log(exception)
        next(exception)
    }
}

app.get('/', getUsers)
app.get('/postagens', getPostagens)