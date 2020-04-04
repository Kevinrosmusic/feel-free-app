'use strict'

var bcrypt = require('bcrypt-nodejs')
var mongoosePaginate = require('mongoose-pagination')
var User = require('../models/user')
var jwt = require('../services/jwt')
var fs = require('fs')
var path = require('path')
var Follow = require('../models/follow')

function home(req, res) {
    res.status(200).send({
        message: 'Probando ruta de pruebas en home'
    })
}

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando ruta de pruebas'
    })
}

function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname &&
        params.nick && params.email && params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        ///////////////////////////////////// CONTROL DUPLICATE USERS //////////////////////////////////////////////////

        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }

            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de usuarios' })

            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario que intentas registrar ya existe' })
            } else {

                //Cifra el password y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar el usuario' })
                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' })
                        }
                    })
                })

            }
        })



    } else {
        res.status(404).send({
            message: 'Envía todos los campos necesarios'
        })
    }
}

////////////////////////////////////////////////// LOGIN /////////////////////////////////////////////////////

function loginUser(req, res) {
    var params = req.body

    var email = params.email
    var password = params.password

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' })

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    ////////////////////////////////////////// RETURN USER DATA /////////////////////////////////////////////////
                    if (params.gettoken) {
                        ///////////////////////////////////////// GENERATE AND RETURN TOKEN ////////////////////////////////////////s
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                        return res.status(200).send
                    } else {

                    }
                    user.password = undefined;
                    return res.status(200).send({ user })
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar' })
                }
            })
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido identificar!' })
        }
    })
}

////////////////////////////////////////////////// USER DATA /////////////////////////////////////////////////

function getUser(req, res) {

    var userId = req.params.id

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({
            message: 'Error en la petición'
        })

        if (err) return res.status(404).send({
            message: 'El usuario no se existe'
        })

        followThisUser(req.user.sub, userId).then((value) => {
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            })
        })

    })
}

async function followThisUser(indentity_user_id, user_id) {
    var following = await Follow.findOne({ 'user': indentity_user_id, 'followed': user_id }).exec((err, follow) => {
        if (err) return handleError(err)
        return follow
    })

    var followed = await Follow.findOne({ 'user': user_id, 'followed': indentity_user_id }).exec((err, follow) => {
        if (err) return handleError(err)
        return follow
    })

    return {
        following: following,
        followed: followed
    }

}

async function followUserIds(user_id) {

    var following = await Follow.find({ 'user': user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).distinct('followed')


    var followed = await Follow.find({ 'followed': user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).distinct('user')

    return {
        following: following,
        followed: followed
    }
}

//////////////////////////////////////////////// USERS PAGINATION //////////////////////////////////////////////

function getUsers(req, res) {
    var identity_user_id = req.user.sub

    var page = 1;
    if (req.params.page) {
        var page = req.params.page
    }

    var itempsPerPage = 5;

    User.find().sort('_id').paginate(page, itempsPerPage, (err, users, total) => {
        if (!users) return res.status(404).send({
            message: 'No hay usuarios disponibles'
        })

        followUserIds(identity_user_id).then((value) => {

            console.log(value)

            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itempsPerPage)
            })

        })
    })
}

/////////////////////////////////////////////////// UPDATE DATA USER /////////////////////////////////////////

function updateUser(req, res) {
    var userId = req.params.id
    var update = req.body

    //Delete pass property
    delete update.password

    if (userId != req.user.sub) {
        return res.status(500).send({
            message: 'No tienes permiso para actualizar los datos de usuario'
        })

        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) return res.status(500).send({ message: 'Error al hacer la petición' })
            if (!userUpdated) return res.status(404).send({
                message: 'No se ha podido actualizar el usuario'
            })

            return res.status(200).send({ user: userUpdated })

        })
    }

}

//////////////////////////////////////////////// UPLOAD IMAGES & AVATAR ////////////////////////////////////////

function uploadImage(req, res) {

    var userId = req.params.id


    if (req.files) {
        var file_path = req.files.image.path

        var file_split = file_path.split('\\')

        var file_name = file_split[2];

        console.log(file_name);

        var ext_split = file_name.split('\.')

        var file_ext = ext_split[1]

        console.log(file_ext)

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos de usuario')
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

            ///////////////////////////////////// UPDATE DATA USER LOGED///////////////////////////////////////////////////

            return User.findByIdAndUpdate(userId, { new: true }, (err, userUpdated) => {

                if (err) return res.status(500).send({ message: 'Error al hacer la petición' })
                if (!userUpdated) return res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                })

                return res.status(200).send({ user: userUpdated })

            })
        } else {

            return removeFilesOfUploads(res, file_path, 'Extensión no valida')
        }

        function removeFilesOfUploads(res, file_path, message) {

            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    message: message
                })
            })
        }

    } else {
        return res.status(200).send({
            message: 'No se ha subido la imagen'
        })
    }
}

////////////////////////////////////////////// GET IMAGE //////////////////////////////////////////////////////

function getImageFile(req, res) {
    var image_file = req.params.imageFile
    var path_file = './uploads/users/' + image_file

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(200).send({ message: 'No existe la imagen' })
        }
    })

}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile
}