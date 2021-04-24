var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('checkouts'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const checkoutSchema = new mongoose.Schema({
    checkID: {type: Number, required: true},
    mealID: {type: Number, required: true},
    orderID: {type: Number, required: false},
    qty: {type: Number, required: true},
    total: {type: Number, required: true}
})