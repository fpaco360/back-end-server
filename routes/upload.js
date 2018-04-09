var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposColeccion = ['hospitales', 'medicos', 'usuarios'];

    if (tiposColeccion.lastIndexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'error coleccion no valida',
            errors: { message: 'error coleccion no valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'error al cargar archivo',
            errors: { message: 'debe seleccionar una imagen' }
        });
    }
    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.')
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //validar extensiones 
    var extensionesValidas = ['jpeg', 'jpg', 'png', 'gif'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'error extension no valida',
            errors: { message: 'extension no valida,' + extensionesValidas.join(',') }
        });
    }

    // crear nombre de archivo personalizado
    /// 134234-124.png
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // mover el archivo del temporal a un path
    var path = `uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'usuario no existe' }
                    });
                }

                var pathViejo = './uploads/usuarios/' + usuario.img;

                //si existe elimina imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {
                    usuarioActualizado.password = ':)';
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });

                });

            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {

                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'hospital no existe',
                        errors: { message: 'hospital no existe' }
                    });
                }

                var pathViejo = './uploads/hospitales/' + hospital.img;

                //verificar si existe y eliminar anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });
            });

            break;
        case 'medicos':

            Medico.findById(id, (err, medico) => {
                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'medico no existe',
                        errors: { message: 'medico no existe' }
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;

                //verificar si existe y eliminar anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen del medico actualizada',
                        medico: medicoActualizado
                    });
                });
            });
            break;
    }
}

module.exports = app;