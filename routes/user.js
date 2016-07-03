
/*
 * GET users listing.
 */

exports.listUser = function(req, res, next){
  req.models.User.list(function(error, users) {
    if (error) return next(error);
    res.render('userList',{users: users, menu: 'admin'});
    // res.send('respond with a resource');
  });
  
};
/*
 * show add admin form
 */
exports.showAddAdmin = function(req, res, next){
  res.render('showAddAdmin', {menu: 'admin'});
}
/*
 * save admin
 */
exports.addAdmin = function(req, res, next){
  req.models.User.findOne({email: req.body.email}, function(error, user){
    if (error) {return next(error)};
    if (user) {
      res.render('showAddAdmin', {error: '用户已存在', menu: 'admin'});
    } else {
      req.models.User.create({email: req.body.email, password: req.body.password, role: req.body.role}, function(error, userResponse){
        if (error) 
          {return next(error)} 
        else {
          res.redirect('/admin');
        }
      })
    }
  })
}
// /*
//  * DELETE user API.
//  */

exports.del = function(req, res, next) {
  if (!req.params.id) return next(new Error('No User ID.'));
  req.models.User.findById(req.params.id, function(error, user) {
    if (error) return next(error);
    if (!user) return next(new Error('user not found'));
    user.remove(function(error, doc){
      if (error) return next(error);
      res.send(doc);
    });
  });
};

/*
 * show update admin form
 */
exports.showUpdateAdmin = function(req, res, next){
  req.models.User.findById(req.params.id, function(error, user){
    if (error) return next(error);
    if (!user) return next(new Error('user not found'));
    res.render('showUpdateAdmin', {user: user, menu: 'admin'});   
  })
  
}

/*
 * update admin
 */
exports.updateAdmin = function(req, res, next){
  if (!req.params.id) return next(new Error('No user ID.'));
  req.models.User.findByIdAndUpdate(req.params.id,{email: req.body.email, password: req.body.password, role: req.body.role}, function(error, user){
    if (error) return next(error);
    res.redirect('/admin');
  })
}



/*
 * GET login page.
 */

exports.login = function(req, res, next) {
  // console.log('http://'+ req.host+ ':' + 3000);
  res.render('login', {menu: 'login'});
};

/*
 * GET logout route.
 */

exports.logout = function(req, res, next) {
  req.session.destroy();
  res.redirect('/login');
};


/*
 * POST authenticate route.
 */

exports.authenticate = function(req, res, next) {
  if (!req.body.email || !req.body.password)
    return res.render('login', {error: 'Please enter your email and password.', menu: 'login'});
  req.models.User.findOne({
    email: req.body.email,
    password: req.body.password
  }, function(error, user){
    if (error) return next(error);
    if (!user) return res.render('login', {error: 'Incorrect email&password combination.'});
    req.session.user = user;
    res.redirect('/');
  })
};
