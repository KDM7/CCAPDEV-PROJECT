var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('orders'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const orderSchema = new mongoose.Schema({
    orderID: {type: Number, required: true},
    status: {type: String, required: true},
    date: {type: Date, required: true},
    customer: {type: Number, required: true},
    restID: {type: Number, required: true},
    total: {type: Number, required: true}
}, {collection: "orders"});

orderSchema.methods.recordNewOrder = async function() {
    var result = orderModel.create(this);
    console.log(JSON.stringify(result));
    return result;
};

orderSchema.methods.recordEditOrder = async function() {
    var result = orderModel.findOneAndUpdate({ orderID: this.orderID }, { status: this.status });
    return result;
};

const orderModel = db.model('orders',orderSchema);

module.exports = orderModel;