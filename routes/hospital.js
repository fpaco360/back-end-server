var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');
//===============================================================
//  GET  OBTENER TODOS LOS HOSPITALES                                 
// ===============================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, hospitales) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'error al cargar hospitales',
                    errors: err
                });
            }
            Hospital.count((err, conteo) => {

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });

            });



        });
});

//===============================================================
//  POST CREAR HOSPITAL                                 
// ===============================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var id_usuario = req.usuario._id;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: id_usuario
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    })

});

//===============================================================
//  PUT ACTUALIZAR HOSPITAL                                 
// ===============================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {

            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id' + id + ' no existe',
                errors: { message: 'no existe hospital con ese id' }
            });
        }
        hospital.nombre = body.nombre,
            hospital.usuario = req.usuario

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });

});

//===============================================================
//  DELETE BORRAR HOSPITAL                                 
// ===============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar hospital'
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con el id' + id,
                errors: { message: 'no existe hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;