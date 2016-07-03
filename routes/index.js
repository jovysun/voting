exports.vote = require('./vote');
exports.user = require('./user');

/*
 * GET home page.
 */

exports.index = function(req, res, next){
	req.models.Vote
	.find()
	.populate('creator')
	.exec(function(error, votes){
	    if (error) return next(error);
	    res.render('index', { votes: votes, menu: 'index'});		
	})

};



