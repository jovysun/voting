var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var VotingRecordSchema = new Schema({
  user: {
  	type: ObjectId,
  	ref: 'User'
  },
  vote: {
    type: ObjectId,
    ref: 'Vote'
  },  
  item: {
    type: ObjectId, 
    ref: 'Item'
  },
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

VotingRecordSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})

VotingRecordSchema.statics = {
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

module.exports = mongoose.model('VotingRecord', VotingRecordSchema);