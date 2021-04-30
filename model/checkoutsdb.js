var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('checkouts'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const checkoutSchema = new mongoose.Schema({
    checkID: {type: Number, required: true},
    mealID: {type: String, required: true},
    orderID: {type: Number, required: false},
    userID: {type: Number, required: true},
    restID: {type: Number, required: true},
    qty: {type: Number, required: true},
    total: {type: Number, required: true}
}, {collection: "checkouts"});

checkoutSchema.methods.recordNewCheckout = async function () {
    checkoutModel.create(this);
    return console.log(this);
};

const checkoutModel = db.model('checkouts', checkoutSchema);

module.exports = checkoutModel;