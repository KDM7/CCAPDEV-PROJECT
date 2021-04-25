var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('meals'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const mealSchema = new mongoose.Schema({
    mealID: {type : String, required: true},
    mealName: {type : String, required: true},
    mealDesc: {type : String, required: true},
    mealPrice: {type : Number, required: true},
    restID: {type: Number, required: true}
}, {collection: "meals"});

const mealModel = db.model('meals', mealSchema);

module.exports = mealModel;