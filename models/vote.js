var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var VoteSchema = new Schema({
  name: {
    unique: true,
    type: String,
    required: true,
    validate: [function(value) {return value.length<=120}, 'Title is too long (120 max)']
  },
  summary: {
  	type: String,
  	default: '主人太忙，没时间写简介。'
  },
  votingUrl: {
    type: String
  },
  creator: {
  	type: ObjectId,
  	ref: 'User'
  },
  items: [{type: ObjectId, ref: 'Item'}],
  votingRecords: [{type: ObjectId, ref: 'VotingRecord'}],
  published: {
  	type: Boolean,
  	default: false
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

VoteSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})

VoteSchema.statics = {
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

module.exports = mongoose.model('Vote', VoteSchema);