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

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

    // client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        await  listDatabases(client);
        await listUsers(client);
 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
async function listUsers(){
    try {
        
        return await client.db('natuvida-mongo').collection('users').find({}).toArray()
    } catch(err){
        console.log(err);
    } finally{
        // await client.close();
    }
};
// main().catch(console.error);

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

app.get('/', getUsers)