var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('employees'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const employeeSchema = new mongoose.Schema({
    userID: {type : Number, required: true},
    restID:{type : Number, required: true},
    shifts:{type: String, required: true}
}, {collection: "employees"});

const employeeModel = db.model('employees', employeeSchema);

module.exports = employeeModel;