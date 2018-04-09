var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;


var hospitalSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'el nombre del hospital es requerido'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });
hospitalSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' })
module.exports = mongoose.model('Hospital', hospitalSchema);