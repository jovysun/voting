var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  // 0 voter
  // 1 admin
  // 2 super admin  
  role: {
  	type: String,
    default: '0'
  },
  votes: {
    type: ObjectId,
    ref: 'Vote'
  },
  votingRecords: [{type: ObjectId, ref: 'VotingRecord'}],
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }    
});



UserSchema.statics = {
  list: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id, cb) {
    return this 
      .findOne({_id: id})
      .exec(cb)
  }
}

module.exports = mongoose.model('User', UserSchema);