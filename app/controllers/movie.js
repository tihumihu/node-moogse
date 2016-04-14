var Movie= require('../models/movie')
var Comment= require('../models/comment')
var _ = require('underscore')
//detail page
exports.detail=function(req,res){
    var id= req.params.id
 /*   Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
        if (err) {
            console.log(err)
        }
    })*/

    Movie.findById(id, function (err, movie) {
        Comment
            .find({movie:id})
            .populate('from','name')
            .populate('reply.from reply.to', 'name')
            .exec(function (err,comments) {
                res.render('detail', {
                    title: 'imooc 详情页',
                    movie: movie,
                    comments: comments
                })
        })

    })
}


//admin page
exports.new=function(req,res){
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
}
//页面数据填充
exports.update= function (req,res) {
    var id = req.params.id
    if(id){
        Movie.findById(id, function (err,movie) {
            res.render('admin',{
                title:'imooc 后台更新页',
                movie: movie
            })
        })
    }
}
//admin post date
exports.save= function (req,res) {
    var movieObj = req.body.movie
    var id = movieObj._id
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
}

//list page
exports.list=function(req,res){
    Movie.fetch(function (err,movies) {
        if(err){
            console.log(err);
        }
        res.render('list',{
            title:'imooc 列表页',
            movies:movies
        })
    })

}

//list detele movie
exports.detele=function (req,res) {
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

}