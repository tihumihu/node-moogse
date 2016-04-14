var express = require('express')
var cookieParser = require('cookie-parser')
var connect = require('connect')
var path = require('path')
var mongoose= require('mongoose')
var session = require('express-session')
var mongoStore = require('connect-mongo')(session);
var Movie= require('./models/movie')
var User= require("./models/user")
var _ = require('underscore')
var bodyParser= require('body-parser');
var port = process.env.PORT || 3000
var app =express()

// movie为mongodb的一个数据库
var dbUrl = "mongodb://localhost/movie"

mongoose.connect(dbUrl)

app.set('views','./views/pages')
app.set('view engine','jade')
app.use(require('body-parser').urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser());
app.use(session({
    secret: 'movie',
    store: new mongoStore({
        url:dbUrl,
        collection:'sessions'
    })
}))
app.listen(port)
app.locals.moment = require('moment')
console.log('immoc started on port'+port)


//预处理
app.use(function (req,res,next) {
    var _user= req.session.user
    if(_user){
        app.locals.user = _user
    }
    next()
})

//index page
app.get('/',function(req,res){
    console.log(req.session.user);


    Movie.fetch(function (err,movies) {
        if(err){
            console.log(err);
        }
        res.render('index',{
            title:'imooc 首页',
            movies:movies
        })
    })

})

//signup
app.post('/user/signup', function (req,res) {
    var _user = req.body.user;
    var user = new User(_user)

    User.find({name:_user.name} , function (err,user) {
        if(err){
            console.log(err);
        }
        if(user){
            return res.redirect('/')
        }else{
            var user = new User(_user)
            user.save(function (err,user) {
                if(err){
                    console.log(err);
                }
                res.redirect('admin/userlist')
            })
        }
    })

})

//logout
app.get('/logout', function (req,res) {
    delete req.session.user
    delete app.locals.user
    res.redirect('/')
})


//signin
app.post('/user/signin', function (req,res) {
    var _user= req.body.user
    var name = _user.name
    var password = _user.password

    User.findOne({name:name}, function (err,user) {
        if(err){
            console.log(err);
        }
        if(!user){
            return res.redirect('/')
        }
        user.comparePassword(password, function (err,isMatch) {
            if(err){
                console.log(err);
            }
            if(isMatch){
                req.session.user = user
                return res.redirect('/')
            }else{
                console.log('Password is not isMatch');
            }
        })
    })
})
//userlist page
app.get('/admin/userlist',function(req,res){
    User.fetch(function (err, users) {
        if(err){
            console.log(err);
        }
        res.render('userlist',{
            title:'imooc 用户列表页',
            users: users
        })
    })

})
//detail page
app.get('/movie/:id',function(req,res){
    console.log(req);
    var id= req.params.id
    Movie.findById(id, function (err, movie) {
        res.render('detail',{
            title:'imooc 详情页',
            movie: movie
        })
    })
})


//admin page
app.get('/admin/movie',function(req,res){
    res.render('admin',{
        title:'imooc 后台录入页',
        movie:[{
            doctor:'',
            country:'',
            title:'',
            year:'',
            poster:'',
            language:'',
            flash:'',
            summary:''
        }]
    })
})
//页面数据填充
app.get('/admin/update/:id', function (req,res) {
    var id = req.params.id
    if(id){
        Movie.findById(id, function (err,movie) {
            res.render('admin',{
                title:'imooc 后台更新页',
                movie: movie
            })
        })
    }
})
//admin post date
app.post('/admin/movie/new', function (req,res) {
    var movieObj = req.body.movie
    var id = movieObj._id //为什么是这么取，这值哪来的
    var _movie
    if(id !== 'undefined'){
        Movie.findById(id, function (err,movie) {
            if(err){
                console.log(err);
            }
            _movie = _.extend(movie,movieObj)
            _movie.save(function (err,movie) {
                if(err){
                    console.log(err);
                }
                res.redirect('/movie/'+ movie._id)
            })
        })
    }
    else{
        _movie = new Movie({
            doctor:movieObj.doctor,
            title:movieObj.title,
            country:movieObj.country,
            language:movieObj.language,
            year:movieObj.year,
            poster:movieObj.poster,
            summary:movieObj.summary,
            flash:movieObj.flash,
        })
        _movie.save(function (err,movie) {
            if(err){
                console.log(err);
            }
            res.redirect('/movie/'+ movie.id)
        })
    }
})

//list page
app.get('/admin/list',function(req,res){
    Movie.fetch(function (err,movies) {
        if(err){
            console.log(err);
        }
        res.render('list',{
            title:'imooc 列表页',
            movies:movies
        })
    })

})

//list detele movie
app.delete('/admin/list', function (req,res) {
    var id = req.query.id;//通过？后面追加参数得到

    if(id){
        Movie.remove({_id: id}, function (err,movie) {
            if(err){
                console.log(err);
            }
            else{
                //给客户端返回数据
                res.json({success:1})
            }
        })
    }

})

