// Requieres -- librerias necesarias necesarias
var express = require('express');
var mongoose = require('mongoose');




//inicializar variables 
var app = express();

//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, res) => {
    if (error) throw error;
    console.log('base de datos', 'online');
});
//rutas

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'peticion realizada correctamente'
    })
})


//escuchar peticiones 

app.listen(3000, () => {
    console.log('express server corriendo en el puerto 3000:', 'online');
});