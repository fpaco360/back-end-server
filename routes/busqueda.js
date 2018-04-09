var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//===============================================================
//  busqueda por coleccion                                 
// ===============================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHopitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'los tipos de busqueda solo son: usuarios,medicos,hospitales',
                error: { message: 'tipo de coleccion no valido' }
            });
    }
    promesa.then(data => {
        return res.status(200).json({
            ok: false,
            [tabla]: data
        });
    });

});
//===============================================================
//  busqueda general                                 
// ===============================================================

app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHopitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)

    ]).then(respuesta => {

        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });

    });

});

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar usuarios', err)
                } else {
                    resolve(usuarios)
                }
            });
    });
}


function buscarHopitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec(
                (err, hospitales) => {
                    if (err) {
                        reject('error al cargar hospitales', err)
                    } else {
                        resolve(hospitales)
                    }
                });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('hospital', 'nombre')
            .populate('usuario', 'nombre email')
            .exec(
                (err, medicos) => {
                    if (err) {
                        reject('error al cargar medicos', err)
                    } else {
                        resolve(medicos)
                    }
                });
    });
}

module.exports = app;