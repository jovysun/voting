var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var ItemSchema = new Schema({
  content: {
  	type: String
  },
  // 0 文本
  // 1 图片
  // 2 flash
  oType: {
  	type: String,
  	default: '0'
  },
  vote: {
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



ItemSchema.statics = {
  list: function(cb) {
    return this
      .find({})
      .sort({_id: -1})
      .exec(cb)
  },
  findById: function(id, cb) {
    return this 
      .findOne({_id: id})
      .exec(cb)
  }
}

module.exports = mongoose.model('Item', ItemSchema);