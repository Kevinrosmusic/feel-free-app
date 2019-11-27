'use strict'

var bcrypt = require('bcrypt-nodejs')
var User = require('../models/user');

function home (req,res) {
	res.status(200).send({
		message: 'Probando ruta de pruebas en home'
	})
}

function pruebas (req,res) {
	res.status(200).send({
		message: 'Probando ruta de pruebas'
	})
}	

function saveUser (req,res){
	var params = req.body;
	var user = new User();

	if(params.name && params.surname &&
		params.nick && params.email && params.password){

		user.name = params.name;
		user.surname = params.surname;
		user.nick = params.nick;
		user.email = params.email;

		bcrypt.hash(params.password, null, null, (err, hash) =>{
			user.password = hash;

			user.save((err, userStored) => {
				if(err) return res.status(500).send({message: 'Error al guardar el usuario'})
				if(userStored){
					res.status(200).send({ user: userStored});
				}	
			})
		} )

	}else{
		res.status(200).send({
			message:'Envía todos los campos necesarios'
		})
	}
}

module.exports = {
	home,
	pruebas
}