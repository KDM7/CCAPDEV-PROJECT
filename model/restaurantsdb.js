var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('restaurants'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const restaurantSchema = new mongoose.Schema({
    restID: {type : Number, required: true},
    restName: {type : String, required: true},
    restAdress: {type : String, required: true},
    wrkHrs: {type : String, required: true}
}, {collection: "restaurants"});

const restaurantModel = db.model('restaurants', restaurantSchema);

module.exports = restaurantModel;