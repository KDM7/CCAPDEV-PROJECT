var mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@persona.3pv17.mongodb.net/CCAPDEV?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('comments'); },
        err => {
            console.log('theres problems');
        });

var db = mongoose.connection;

const commentSchema = new mongoose.Schema({
    commentID: {type: Number, required: true},
    userID: {type: Number, required: true},
    restID: {type: Number, required: true},
    comment: {type: String, required: true},
    rating: {type: Number, required: true}
}, {collection: "comments"});

commentSchema.methods.recordNewComment = async function() {
    var result = commentModel.create(this);
    console.log(JSON.stringify(result));
    return result;
};

const commentModel = db.model('comments', commentSchema);

module.exports = commentModel;