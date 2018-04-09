var express = require('express');
var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');
var Medico = require('../models/medico');

//===============================================================
//  GET OBTENER TODOS LOS MEDICOS                                 
// ===============================================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err, medicos) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'error al cargar medicos',
                    errors: err
                });
            }
            Medico.count((err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });

            });


        })
});
//===============================================================
//  PUT CREAR UN MEDICO                                 
// ===============================================================

app.put('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var id_usuario = req.usuario._id;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: id_usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});
//===============================================================
//  PUT MODIFICAR MEDICO                                 
// ===============================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar medico'
            });
        }

        if (!medico) {

            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id' + id + ' no existe',
                errors: { message: 'no existe medico con ese id' }
            });
        }
        medico.nombre = body.nombre,
            medico.hospital = body.hospital
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });
});

//===============================================================
//  DELETE BORRAR UN MEDICO                                 
// ===============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al borrar medico'
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con el id' + id,
                errors: { message: 'no existe medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});
module.exports = app;