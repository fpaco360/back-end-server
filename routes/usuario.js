var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');
var Usuario = require('../models/usuario');

//===============================================================
// OBTENER TODOS LOS USUARIOS
// ==============================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count((err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });


            });


});

//===============================================================
// ACTUALIZAR USUARIO 
// ==============================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {

            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + ' no existe',
                errors: { message: 'no existe usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = '=)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });

});

//===============================================================
// CREAR UN NUEVO USUARIO
// ==============================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });


    });
});


//===============================================================
//  BORRAR USUARIO
// ==============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: { message: 'no existe usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});
module.exports = app;