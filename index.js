const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const jsonParser = bodyParser.json();

const app = express();

let {CommentController} = require('./model');
let {DATABASE_URL, PORT} = require('./config');

app.use(express.static('public'));
app.use(morgan('dev'));

app.get('/blog-api/comentarios', (req, res) => {
    CommentController.getAll()
        .then(comments => {
            return res.status(200).json(comments);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "DB error";
            return res.status(500).send();
        })
})

app.get('/blog-api/comentarios-por-autor', (req,res) => {
    const autor = req.query.autor;
    if(autor === undefined) {
        return res.status(406).send('No se proporciono el autor.');
    }

    CommentController.getByAuthor(autor)
        .then(comments => {
            return res.status(200).json(comments);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "DB error";
            return res.status(500).send();
        })
})

app.post('/blog-api/nuevo-comentario', jsonParser, (req, res) => {
    const {titulo, contenido, autor} = req.body;
    if(!titulo || !contenido || !autor) {
        return res.status(406).send('El contenido de la peticion no esta completo');
    }

    let comentario = {
        titulo: titulo,
        contenido: contenido,
        autor: autor,
        fecha: new Date
    };

    CommentController.create(comentario)
        .then(com => {
            return res.status(201).json(com);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "DB error";
            return res.status(500).send();
        })

})

app.delete('/blog-api/remover-comentario/:id', jsonParser, (req, res) => {
    const id = req.params.id;

    CommentController.getById(id)
        .then(com => {
            CommentController.delete(id)
                .then(removed => {
                    return res.status(200).send();
                })
                .catch(error => {
                    console.log(error);
                    res.statusMessage("DB error");
                })
        })
        .catch(error => {
            console.log(error);
            res.statusMessage("The given id does not exist");
            return res.status(404).send();
        })

})

app.put('/blog-api/actualizar-comentario/:id', jsonParser, (req, res) => {
    const {id, titulo, contenido, autor} = req.body;

    if(!id) {
        return res.status(406).send('No se proporciono el id en el cuerpo');
    }

    if(id != req.params.id) {
        return res.status(409).send('Los ids no coinciden');
    }

    if(!titulo && !contenido && !autor) {
        return res.status(409).send('No se envio ningun valor para actualizar');
    }

    let newComment = {};

    if(titulo) {
        newComment.titulo = titulo;
    }

    if(autor) {
        newComment.autor = autor;
    }

    if(contenido) {
        newComment.contenido = contenido;
    }


    CommentController.getById(id)
        .then(c => {
            CommentController.update(id, newComment)
                .then(com => {
                    return res.status(202).json(com);
                })
                .catch(error => {
                    console.log(error);
                    res.statusMessage = "Database error";
                    return res.status(500).send();
                });
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "The given id does not exist";
            return res.status(404).send();
        });

    
})

let server;

function runServer(port, databaseUrl) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }, response => {
            if (response) {
                return reject(response);
            }
            else {
                server = app.listen(port, () => {
                    console.log("App is running on port " + port);
                    resolve();
                })
                    .on('error', err => {
                        mongoose.disconnect();
                        return reject(err);
                    })
            }
        });
    });
}

function closeServer() {
    return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing the server');
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
}

runServer(PORT, DATABASE_URL);

module.exports = {app, runServer, closeServer};