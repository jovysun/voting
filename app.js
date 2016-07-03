var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || 'ABC'
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || 'XYZXYZ'

var express = require('express'),
  routes = require('./routes'),
  formidable = require('formidable'),
  util = require('util'),
  fs = require('fs'),  
  http = require('http'),
  path = require('path'),
  mongoose = require('mongoose'),
  models = require('./models'),
  dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/voting',
  db = mongoose.connect(dbUrl, {safe: true}),

  everyauth = require('everyauth');

var session = require('express-session'),
  logger = require('morgan'),
  errorHandler = require('errorhandler'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override');

everyauth.debug = true;
everyauth.twitter
  .consumerKey(TWITTER_CONSUMER_KEY)
  .consumerSecret(TWITTER_CONSUMER_SECRET)
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    var promise = this.Promise();
    process.nextTick(function(){
        if (twitterUserMetadata.screen_name === 'azat_co') {
          session.user = twitterUserMetadata;
          session.admin = true;
        }
        promise.fulfill(twitterUserMetadata);
    })
    return promise;
    // return twitterUserMetadata
  })
  .redirectPath('/admin');

// We need it because otherwise the session will be kept alive
everyauth.everymodule.handleLogout(routes.user.logout);


everyauth.everymodule.findUserById( function (user, callback) {
  callback(user)
});


var app = express();
app.locals.appTitle = "简易投票系统";

app.use(function(req, res, next) {
  if (!models.Vote || ! models.User) return next(new Error("No models."))
  req.models = models;
  return next();
});



// All environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(session({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}))
app.use(everyauth.middleware());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.session && req.session.admin)
    res.locals.admin = true;
  next();
});

// Authorization
var authorize = function(req, res, next) {
  if (req.session && req.session.user)
    return next();
  else
    // return res.send(401);
    res.redirect('/login');
};

// Development only
if ('development' === app.get('env')) {
  app.use(errorHandler());
}


// Pages and routes
app.get('/', authorize, routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate);
app.get('/logout', routes.user.logout); //if you use everyauth, this /logout route is overwriting by everyauth automatically, therefore we use custom/additional handleLogout
app.get('/listUser', authorize, routes.user.listUser);
app.get('/showAddAdmin', authorize, routes.user.showAddAdmin);
app.post('/addAdmin', authorize, routes.user.addAdmin);
app.get('/showUpdateAdmin/:id', authorize, routes.user.showUpdateAdmin);
app.post('/updateAdmin/:id', authorize, routes.user.updateAdmin);
app.get('/createVote', authorize, routes.vote.createVote);
app.post('/saveVote', authorize, routes.vote.saveVote);
app.get('/getVote/:id', routes.vote.show);
app.get('/createItemText/:voteId', authorize, routes.vote.createItemText);
app.post('/saveItemText', authorize, routes.vote.saveItemText);
app.post('/reviewVote', authorize, routes.vote.reviewVote);
app.get('/voting/:voteId', routes.vote.getVoting);
app.post('/voting', routes.vote.voting);
app.get('/votingResult/:voteId', routes.vote.votingResult);
app.get('/publish/:voteId', routes.vote.publish);

// REST API routes
app.del('/api/admin/:id', routes.user.del);
app.del('/api/vote/:id', routes.vote.del);
// app.all('/api', authorize);
// app.get('/api/articles', routes.vote.list);
// app.post('/api/articles', routes.vote.add);
// app.put('/api/articles/:id', routes.vote.edit);
// app.del('/api/articles/:id', routes.vote.del);

app.get('/createItemImage/:voteId', authorize, function(req, res, next){
  req.models.Vote.findById(req.params.voteId,function(error, vote){
    if (error) return next(error);
    res.render('getFormidable', {vote: vote});   
  })  
});
app.post('/upload/:id', function(req, res, next){
    // parse a file upload 
    var form = new formidable.IncomingForm();   //创建上传表单
      form.encoding = 'utf-8';    //设置编辑
      form.uploadDir = 'public/img';   //设置上传目录
      form.keepExtensions = true;  //保留后缀
      form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
 
    form.parse(req, function(err, fields, files) {
      console.log(files);
      var imgSrc = files.upload.path;
      imgSrc = 'http://' + req.host + ':3000/' + imgSrc.substring(7);

      req.models.Vote.findById(req.params.id, function(error, vote){
        var item = {
          content: imgSrc,
          oType: 1,
          vote: vote._id
        };
        req.models.Item.create(item, function(error, item) {
          if (error) return next(error);
          vote.items.push(item);
          vote.save();
          res.redirect('/getVote/' + vote._id);
        });  
      });
    });
});




app.all('*', function(req, res) {
  res.send(404);
})

// http.createServer(app).listen(app.get('port'), function(){
  // console.log('Express server listening on port ' + app.get('port'));
// });

var server = http.createServer(app);
var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}
var shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
} else {
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
