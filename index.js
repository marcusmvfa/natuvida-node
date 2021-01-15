const express = require('express');
const bodyParser = require('body-parser');
const smartphone = require('./routes/smartphonesRoutes'); // Importa rota
const app = express();
const {MongoClient, ObjectId} = require('mongodb');
app.use('/smartphones', smartphone);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var db ={};
const uri = 'mongodb+srv://admin:9844@clusternatuvida.v83d2.mongodb.net/natuvida-mongo?retryWrites=true&w=majority';
const path = require('path');
const { response } = require('express');
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
async function listPostagensDetalhes(id){
    try {
        var jsonDetalhes = await client.db('natuvida-mongo').collection('perguntas').find({"idPostagem": ObjectId(id)}).toArray();
        jsonDetalhes.forEach(async function(element) {
            var o = ObjectId(element._id);
            var lstDetalhes = [];
            element.postagemDetalhes.forEach(async function(el){
                el.idPostagem = o;
                lstDetalhes.push(el);
            });
            // await client.db('natuvida-mongo').collection('perguntas').insertMany(lstDetalhes);
            console.log(lstDetalhes);
        });
        // console.log(array);
        return jsonDetalhes
    } catch(err){
        console.log(err);
    } finally{
        // await client.close();
    }
};

async function postUser(user){
    ///usuario ja cadastrado = E001
    ///outro erro = E002
    try{
        var usuario = await client.db('natuvida-mongo').collection('users').findOne({"email": user.email});
        if(usuario == null){
            var response = await client.db('natuvida-mongo').collection('users').insertOne(user);
            console.log(response);
            return response;
        }
        else 
        return "E001";

    } catch (exception) {
        console.log('@@@')
        console.log(exception);
        return "E002";
    }
};
async function reqLogin(loginData){
    try{
        var response = await client.db('natuvida-mongo').collection('users').findOne({'email': loginData.email, 'senha': loginData.senha});
            return response;
    } catch(exception){
        console.log('@@@')
        console.log(exception);
        return exception;
    }
};
async function sendRespostas(respostas){
    try{
        var idsPerguntas = [];
        respostas.forEach((element) => {
            element.dataInclusao = new Date().toISOString();
            idsPerguntas.push(element.idPergunta);
        });
        var historico = [];
        var response = await client.db('natuvida-mongo').collection('respostas').insertMany(respostas);
        var i;
        for (i = 0; i < response.insertedCount; i++) {
            historico.push({
                "idPergunta": ObjectId(idsPerguntas[i]),
                "idResposta": ObjectId(response.insertedIds[i]), 
                "idUsuario": ObjectId(respostas[0].idUsuario),
                "dataInclusao": new Date().toISOString()});
          }
        var responseHistorico = await client.db('natuvida-mongo').collection('historico').insertMany(historico);
        return responseHistorico;        
    } catch(exception){
        console.log('@@@')
        console.log(exception);
        return exception;
    }
};
async function updateUSer(user){
    try {
        user.dataAlteracao = new Date().toISOString();
        var response = await client.db('natuvida-mongo')
        .collection('users')
        .updateOne({"_id": ObjectId(user._id)},
        {$set: {"nome":user.nome, "email": user.email, "fone": user.fone}});
        console.log('s');
        return response;
    } catch (exception) {
        console.log('@@@')
        console.log(exception);
        return exception;
    }
}
async function cadastroDetalhes(list){
    try{
        list.forEach(element => {
            var object = ObjectId(element.idPostagem);
            element.idPostagem = object;
             dataNow = Date.now();
             element.dataInclusao = new Date(dataNow).toLocaleDateString();
        });
        var response = await client.db('natuvida-mongo').collection('perguntas').insertMany(list);        
        console.log(response);
        return response;

    } catch (exception) {
        console.log('@@@')
        console.log(exception)
    }
}

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
        let users = await listPostagens()
        console.log('### Posts ###')
        console.log(users)
        res.json(users)
    } catch (exception) {
        console.log('@@@')
        console.log(exception)
        next(exception)
    }
}
async function getPostagensDetalhes(req, res, next) {
    try {
        let users = await listPostagensDetalhes(req.query.id)
        console.log('### PostsDetalhes ###')
        console.log(users)
        res.json(users)
    } catch (exception) {
        console.log('@@@')
        console.log(exception)
        next(exception)
    }
}

async function postNewUser(req, res, next){
    try {
        var response = await postUser(req.body);
        console.log('### Post New User');
        console.log(req.body);
        if(response == "E001")
            res.status(500).send("E-mail já cadastrado!")
        else if(response == "E002")
            res.status(500).send("Ocorreu um erro tente novamente!");
        else
            res.status(200).json(response);
    } catch(exception){
        console.log('@@@');
        console.log(exception);
        res.status(500).send("Não foi possível salvar o usuário");
        next(exception);
    }
}
async function postDetalhes(req,res, next){
    try {
        console.log('### Post Detalhes');
        console.log(req.body);
        return await cadastroDetalhes(req.body);
    } catch(exception){
        console.log('@@@');
        console.log(exception);
        next(exception);
    }
}
async function login(req, res, next){
    try {
        console.log('### Login');
        console.log(req.body);
        var response = await reqLogin(req.body);
return res.json(response);

    } catch(exception){
        console.log('@@@');
        console.log(exception);
        next(exception);
    }
}

async function postResposta(req, res, next){
    try{
        console.log('### Post Resposta');
        console.log(req.body);
        var response = await sendRespostas(req.body);
return res.json(response);
    } catch(exception){
        console.log("@@@");
        console.log(exception);
        res.status(500).send(exception);
        next(exception);
    }
}

async function putUser(req, res, next){
    try{
        console.log('### Put User');
        console.log(req.body);
        var response = await updateUSer(req.body);
return res.json(response);
    } catch(exception){
        console.log("@@@");
        console.log(exception);
        res.status(500).send(exception);
        next(exception);
    }
}

app.post('/postNewUser', postNewUser);
app.post('/postDetalhes', postDetalhes);
app.post('/login', login);
app.post('/postRespostas', postResposta);
app.put('/putUser', putUser)

app.get('/', getUsers);
app.get('/getPostagens', getPostagens);
app.get('/getPostagemDetalhes', getPostagensDetalhes);

app.get('/autoconhecimento', function(req,res){
        res.sendFile(__dirname + '/imagens/AUTOCONHECIMENTO.jpg');
});
app.get('/cerebro', function(req,res){
        res.sendFile(__dirname + '/imagens/CEREBRO.jpg');
});
app.get('/dordocliente', function(req,res){
        res.sendFile(__dirname + '/imagens/DORDOCLIENTE.jpg');
});
app.get('/emocoes', function(req,res){
        res.sendFile(__dirname + '/imagens/EMOCOES.jpg');
});
app.get('/mindset', function(req,res){
        res.sendFile(__dirname + '/imagens/MINDSET.jpg');
});
app.get('/motivacao', function(req,res){
        res.sendFile(__dirname + '/imagens/MOTIVACAO.jpg');
});
app.get('/tecnicasdevenda', function(req,res){
        res.sendFile(__dirname + '/imagens/TECNICASDEVENDAS.jpg');
});
app.get('/maslow', function(req,res){
        res.sendFile(__dirname + '/imagens/maslow.jpg');
});
app.get('/muitobem', function(req,res){
        res.sendFile(__dirname + '/imagens/Trabalhando.jpg');
});
app.get('/Comportamento-Pessoal', function(req,res){
    res.sendFile(__dirname + '/imagens/Comportamento-Pessoal.jpg');
});
app.get('/Pos-Venda', function(req,res){
    res.sendFile(__dirname + '/imagens/Pos-Venda.jpg');
});
app.get('/Relacao-Cliente', function(req,res){
    res.sendFile(__dirname + '/imagens/Relacao-Cliente.jpg');
});
app.get('/Quanto-Conteudo', function(req,res){
    res.sendFile(__dirname + '/imagens/Quanto-Conteudo.jpg');
});
app.get('/Finalizamos', function(req,res){
    res.sendFile(__dirname + '/imagens/Finalizamos.jpg');
});
