// /*
//  * GET article page.
//  */

exports.show = function(req, res, next) {
  if (!req.params.id) return next(new Error('No vote ID.'));
	req.models.Vote.findOne({_id: req.params.id})
	.populate('items')
	.exec(function(error, vote){
		res.render('vote', {vote: vote})
	})
};

exports.createItemText = function(req, res, next) {
  if (!req.params.voteId) return next(new Error('No vote ID.'));
  req.models.Vote.findById(req.params.voteId,function(error, vote){
    if (error) return next(error);
    res.render('createItemText', {vote: vote});  	
  })
};


exports.reviewVote = function(req, res, next){
	if (!req.body.voteId) return next(new Error('No vote ID.'));
	req.models.Vote.findOne({_id: req.body.voteId})
	.populate('items')
	.exec(function(error, vote){
		res.render('reviewVote', {vote: vote})
	})	
};

exports.getVoting = function(req, res, next){
	var voteId = req.params.voteId;
	if (!voteId) return next(new Error('No vote ID.'));

	req.models.Vote.findOne({_id: req.params.voteId})
	.populate('items')
	.exec(function(error, vote){
		res.render('voting', {vote: vote})
	})
}

exports.voting = function(req, res, next){
	if (!req.body.voteId) return next(new Error('No vote ID.'));

    function getClientIp(req) {
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    }

    var ipStr = getClientIp(req);
    ipStr = ipStr.substring(ipStr.lastIndexOf(':')+1);
	var userName = ipStr;
	var itemId = req.body.myItem;
	var voteId = req.body.voteId;
	var msg = '谢谢您的参与！';

	req.models.User.findOne({email: userName}, function(error, user){
		if (error) return next(error);
		if (user) {
			req.models.VotingRecord.findOne({user: user._id, vote: voteId}, function(error, votingRecord){
				if (error) return next(error);
				if (votingRecord) {
					res.redirect('/votingResult/' + voteId);							
					
				}else{
				    var votingRecord = {
				    	user: user._id,
				    	vote: voteId,
				    	item: itemId
				    };
				    req.models.VotingRecord.create(votingRecord, function(error, votingRecord){
				    	if (error) return next(error);
				    	req.models.Item.findById(itemId, function(error, item){
				    		item.votingRecords.push(votingRecord);
				    		item.save();
				    	})			    	
				    	user.votingRecords.push(votingRecord);
				    	user.save();
				    	req.models.Vote.findById(voteId, function(error, vote){
							if (error) return next(error);
							vote.votingRecords.push(votingRecord);
							vote.save();				    		
				    	})		 						    	
						res.redirect('/votingResult/' + voteId);	
				    })					
				}
			})			
		}else{
			req.models.User.create({email: userName}, function(error, user){
				if (error) return next(error);
				if(!user) return next(new Error('save user fail, please try again'));
			    var votingRecord = {
			    	user: user._id,
			    	item: itemId
			    };
			    req.models.VotingRecord.create(votingRecord, function(error, votingRecord){
			    	if (error) return next(error);
			    	req.models.Item.findById(itemId, function(error, item){
			    		item.votingRecords.push(votingRecord);
			    		item.save();
			    	})
			    	user.votingRecords.push(votingRecord);
			    	user.save();
			    	req.models.Vote.findById(voteId, function(error, vote){
						if (error) return next(error);
						vote.votingRecords.push(votingRecord);
						vote.save();				    		
			    	})	

					res.redirect('/votingResult/' + voteId);
			    })			
			})
		}

	})

	
	// console.log('myIP:' + getClientIp(req));

}

exports.votingResult = function(req, res, next){
	req.models.Vote.findOne({_id: req.params.voteId})
	.populate('items')
	.exec(function(error, vote){
		if (error) return next(error);					
		res.render('votingResult', {vote: vote});
	});		
}

exports.createVote = function(req, res, next) {
  res.render('createVote', {menu: 'vote'});
};

exports.del = function(req, res, next) {
  if (!req.params.id) return next(new Error('No Vote ID.'));
  req.models.Vote.remove({_id: req.params.id},function(error, rows){
  	if (error) return next(error);  
  	console.log('remove vote count:' + rows);  	

  });
  req.models.Item.remove({vote: req.params.id},function(error, rows){
  	if (error) return next(error);
  	console.log('remove item count:' + rows);
  	res.send('success');
  });
};

// /*
//  * POST vote page.
//  */

exports.saveVote = function(req, res, next) {
  if ( !req.body.name || !req.body.summary ) {
    return res.render('createVote', {error: '请填写名称和简介。'});
  }
  var vote = {
    name: req.body.name,
    summary: req.body.summary,
    published: false,
    creator: req.session.user._id
  };
  req.models.Vote.create(vote, function(error, vote) {
    if (error) return next(error);
    res.redirect('/');
  });  
};

exports.saveItemText = function(req, res, next) {
  if ( !req.body.content ) {
    return res.send({error: '请填写名称和简介。'});
  }
  req.models.Vote.findById(req.body.voteId, function(error, vote){
	  var item = {
	    content: req.body.content,
	    oType: req.body.oType,
	    vote: vote._id
	  };
	  req.models.Item.create(item, function(error, item) {
	    if (error) return next(error);
	    vote.items.push(item);
	    vote.save();
	    res.redirect('/getVote/' + vote._id);
	  });  
  });

};

exports.publish = function(req, res, next){
	var voteId = req.params.voteId;
	if (!voteId) return next(new Error('No vote ID.'));
	req.models.Vote.findById(voteId, function(error, vote){
		vote.published = true;
		vote.votingUrl = 'http://' + req.host + ':3000/voting/' + voteId;
		vote.save();
		res.redirect('/');
	})	
}