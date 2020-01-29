function watchForms() {
    $('#nameSearch').on('submit', (event) => {
        event.preventDefault();
        let name = $('#nameInput').val();
        if(name === "") {
            fetchComments();
        } else {
            fetchByAuthor(name);
        }
    })

    $('#addComment').on('submit', (event) => {
        event.preventDefault();
        
        let titulo = $('#commentTitle').val();
        let autor = $('#commentAuthor').val();
        let contenido = $('#commentContent').val();

        $('#commentTitle').val('');
        $('#commentAuthor').val('');
        $('#commentContent').val('');

        let newPost = {
            titulo: titulo,
            autor: autor,
            contenido: contenido
        }

        postComment(newPost)
    })

    $('#commentsDisplay').on('submit', '.updateComment', (event) => {
        event.preventDefault();

        let titulo = $('#commentTitleEdit').val();
        let autor = $('#commentAuthorEdit').val();
        let contenido = $('#commentContentEdit').val();

        if (titulo == "" && autor == "" && contenido == "") {
            return;
        }

        let updatedComment = {};

        if (titulo != "") {
            updatedComment.titulo = titulo;
        }
        if (autor != "") {
            updatedComment.autor = autor;
        }
        if (contenido != "") {
            updatedComment.contenido = contenido;
        }

        let id = $(event.target).parent().parent().find('.editButton').val();

        updatedComment.id = id;

        updateComment(updatedComment, id);
        
    })
}

function buttonFunctionality() {
    $('#commentsDisplay').on('click', '.editButton', (event) => {
        $(event.target).parent().parent().parent().find('.updateCommentContainer').empty();
        $(event.target).parent().parent().find('.updateCommentContainer').append(`
            <form class="updateComment">
                <div>
                    <label for="commentTitle">Title:</label>
                    <input type="text" id="commentTitleEdit" name="commentTitle">
                </div>
                <div>
                    <label for="commentAuthor">Author:</label>
                    <input type="text" id="commentAuthorEdit" name="commentAuthor">
                </div>
                <div>
                    <label for="commentContent">Content:</label>
                    <textarea name="commentContent" id="commentContentEdit" cols="50" rows="5"></textarea>
                </div>
                <button type="submit">Update!</button>
            </form>
        `);
    });

    $('#commentsDisplay').on('click', '.deleteButton', (event) => {
        console.log($(event.target).val());
        deleteComment($(event.target).val());
    });
}

function fetchComments() {
    let url = '/blog-api/comentarios';

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function(responseJSON) {
            displayComments(responseJSON);
        },
        error: function(err) {
            console.log(err);
            alert('Could not obtain comments');
        }
    })
}

function fetchByAuthor(author) {
    let url = `/blog-api/comentarios-por-autor?autor=${author}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function(responseJSON) {
            displayComments(responseJSON);
        },
        error: function(err) {
            if(err.status == 404) {
                alert('No comments registered under such author');
            }
        }
    })
}

function postComment(comment) {
    let url = '/blog-api/nuevo-comentario';

    $.ajax({
        url: url,
        method: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(comment),
        success: function(responseJSON) {
            fetchComments();
        },
        error: function(err) {
            if(err.status == 406) {
                alert('Not enough data was given to create a new post');
            } else {
                alert('Could not create new comment.');
            }
        }
    })
}

function updateComment(comment, id) {
    let url = `/blog-api/actualizar-comentario/${id}`;

    $.ajax({
        url: url,
        method: "PUT",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(comment),
        success: function(resposeJSON) {
            fetchComments();
        },
        error: function(err) {
            if (err.status == 406) {
                alert("Parameter error");
            } else if (err.status == 409) {
                alert("Paramter error");
            } else if (err.status == 404) {
                alert("The given id does not exist");
            }
            console.log(err);
        }
    });
}

function deleteComment(id) {
    let url = `/blog-api/remover-comentario/${id}`
    $.ajax({
        url: url,
        method: "DELETE",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(resposeJSON) {
            fetchComments();
        },
        error: function(err) {
            if (err.status == 404) {
                alert("The given id does not exist");
            }
            fetchComments();
        }
    });
}

function displayComments(response) {
    let container = $('#commentsDisplay');

    $(container).empty();

    response.forEach((el) => {
        $(container).append(`
            <div class="postContainer">
                <div class="post">
                    <h2>${el.titulo}</h2>
                    <h4>By ${el.autor}</h4>
                    <p>${el.contenido}</p>
                    <p>Posted on: ${el.fecha}</p>
                </div>
                <div class="buttons">
                    <button value="${el._id}" class="editButton">Edit</button>
                    <button value="${el._id}" class="deleteButton">Delete</button>
                </div>
                <div class="updateCommentContainer"></div>
            </div>
        `)
    })
}

function init() {
    fetchComments();
    watchForms();
    buttonFunctionality();
}

init();