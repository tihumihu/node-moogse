var Index= require('../app/controllers/index.js')
var User= require('../app/controllers/user.js')
var Movie= require('../app/controllers/movie.js')
var Comment= require('../app/controllers/comment.js')

module.exports= function (app) {
    //app.use(require('body-parser').urlencoded({extended: true}))
    //预处理
    app.use(function (req,res,next) {
        var _user= req.session.user
        app.locals.user = _user
        next()
    })

//index page
    app.get('/', Index.index)

//User
    app.post('/user/signup', User.signup)
    app.get('/logout', User.logout)
    app.post('/user/signin', User.signin)
    app.get('/admin/userlist',User.signinRequired,User.adminRequired,User.list)


//Movie
    app.get('/movie/:id',User.signinRequired,User.adminRequired,Movie.detail)
    app.get('/admin/movie',Movie.new)
    app.get('/admin/update/:id', Movie.update)
    app.post('/admin/movie/new', Movie.save)
    app.get('/admin/list',Movie.list)
    app.delete('/admin/list', Movie.detele)

//    comment
    app.post('/user/comment',User.signinRequired,Comment.save)
}
