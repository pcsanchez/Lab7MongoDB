const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let commentCollection = mongoose.Schema({
    titulo: String,
    contenido: String,
    autor: String,
    fecha: Date
});

let Comment = mongoose.model('comment', commentCollection);

let CommentController = {
    getAll: function() {
        return Comment.find()
            .then(comments => {
                return comments;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    getByAuthor: function(autor) {
        return Comment.find({autor: autor})
            .then(comments => {
                return comments;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    create: function(newComment) {
        return Comment.create(newComment)
            .then(newC => {
                return newC;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    delete: function(id) {
        return Comment.findByIdAndDelete(id)
            .then(com => {
                return com;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    update: function(id, newComment) {
        return Comment.findByIdAndUpdate(id, newComment)
            .then(com => {
                return com;
            })
            .catch(error => {
                throw Error(error);
            })
    },
    getById: function(id) {
        return Comment.findById(id)
            .then(com => {
                return com;
            })
            .catch(error => {
                throw Error(error);
            });
    }
}

module.exports = {CommentController}