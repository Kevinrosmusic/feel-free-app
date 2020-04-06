'use-strict'

var fs = require('fs')
var path = require('path')
var mongoosePaginate = require('mongoose-pagination')
var moment = require('moment')

var Publication = require('../models/publication')
var User = require('../models/user')
var Follow = require('../models/follow')


function probando(req, res) {
    res.status(200).send({
        message: 'Hola desde el controlador de publicaciones'
    })
}

function savePublication(req, res) {
    var params = req.body
    var publication = new Publication()

    if (!params.text) return res.status(200).send({
        message: 'El post debe tener un texto'
    })

    var publication = new Publication()

    publication.text = params.text
    publication.file = 'null'
    publication.user = req.user.sub
    publication.created_at = moment().unix()

    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({
            message: 'Error  al guardar la publicación'
        })

        if (!publicationStored) return res.status(404).send({ message: 'La publicación no ha sido guardada' })

        return res.status(200).send({ publication: publicationStored })
    })
}

function getPublications(req, res) {
    var page = 1;

    if (req.params.page) {
        page = req.params.page
    }

    console.log(req.user.sub)


    var itemsPerPage = 4

    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {

        if (err) return res.status(500).send({
            message: 'Error al devolver el seguimiento'
        })

        var follows_clean = []

        follows.forEach((follow) => {

            follows_clean.push(follow.user)
        })

        Publication.find({ user: { "$in": follows_clean } }).sort('-created_at').populate('user')
            .paginate(page, itemsPerPage, (err, publications, total) => {




                if (err) return res.status(500).send({
                    message: 'Error al devolver las publicaciones'
                })

                if (!publications) return res.status(404).send({
                    message: 'No hay publicaciones'
                })

                return res.status(200).send({
                    total_items: total,
                    publications,
                    pages: Math.ceil(total / itemsPerPage),
                    page: page
                })
            })
    })

}

function getPublication(req, res) {
    var publicationId = req.params.id

    Publication.findById(publicationId, (err, publication) => {

        if (err) return res.status(500).send({
            message: 'Error al devolver publicación'
        })

        if (!publication) return res.status(404).send({
            message: 'No existe la publicación'
        })

        return res.status(200).send({ publication })

    })
}

function deletePublication(req, res) {
    var publicationId = req.params.id

    Publication.find({ 'user': req.user.sub, '_id': publicationId }).exec((err, publicationsRemoved) => {

        if (err) return res.status(500).send({
            message: 'Error al borrar publicación'
        })

        if (!publicationsRemoved[0]) return res.status(404).send({
            message: "No existe la publicación"
        })
        else {

            Publication.find({ 'user': req.user.sub, '_id': publicationId }).remove(err => {
            	
                return res.status(200).send({ message: "Publicación eliminada correctamente" })
            })
        }
    })
}

module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication
}