var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('orders'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const orderSchema = new mongoose.Schema({
    userID: {type: Number, required: true},
    status: {type: String, required: true},
    date: {type: Date, required: true},
    total: {type: Number, required: true},
    finish: {type: Boolean, required: true}
}, {collection: "orders"});

orderSchema.methods.recordNewOrder = async function() {
    var result = orderModel.create(this);
    console.log(JSON.stringify(result));
    return result;
};

const orderModel = db.model('orders',orderSchema);

module.exports = orderModel;