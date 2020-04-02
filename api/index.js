'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Conexión a la base de datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/social_media_project', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> { 
	console.log("La conexión a la base de datos social_media_project ha sido satisfactoria")

	// Crear servidor
	app.listen(port, () =>	{

		console.log("EL servidor está corriendo correctamente por el puerto " + port);
	})
})
.catch(err => console.log(err)); 

