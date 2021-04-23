var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('user'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const userSchema = new mongoose.Schema({
    userID: { type: Number, required: true },
    password: { type: String, required: true },
    lastName: { type: String, required: true },
    firstName: { type: String, required: true }
}, { collection: "users" });

userSchema.methods.recordNewUser = async function() {
    var result = userModel.create(this);
    console.log(JSON.stringify(result));
    return result;
};

const userModel = db.model('users', userSchema);

module.exports = userModel;