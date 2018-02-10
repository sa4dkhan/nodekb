const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require ('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});
//Check DB errors
db.on('error', function(){
  console.log('err');
});

//Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')))

//Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator Middleware
// app.use(expressValidator(middlewareOptions));
// app.post('/create-user', yourValidationChains, (req, res, next) => {
//   const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
//     // Build your resulting errors however you want! String, object, whatever - it works!
//     return `${location}[${param}]: ${msg}`;
//   };
//   const result = validationResult(req).formatWith(errorFormatter);
//   if (!result.isEmpty()) {
//     // Response will contain something like
//     // { errors: [ "body[password]: must be at least 10 chars long" ] }
//     return res.json({ errors: result.array() });
//   }
//
//   // Handle your request as if no errors happened
// });


//Home Route

app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    }else{
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

//Get Single Article
app.get('/article/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article',
      {
        article:article
      })
  });
});


//Add Route
app.get('/articles/add', (req, res) =>
  res.render('add_article',
    {
      title: 'Add Article'
    })
)

// Add Submit POST Route
app.post('/articles/add', function(req, res){
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  article.save(function(err){
    if(err){
      console.log(err);
      return;
    }else{
      res.redirect('/');
    }
  });
});

//Load Edit Form
app.get('/article/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article',
      {
        title: 'Edit Article',
        article:article
      })
    // console.log(article);
  });
});

// Update Submit POST Route
app.post('/articles/edit/:id', function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      res.redirect('/');
    }
  });
});

// Delete Post
app.delete('/article/:id', function(req, res){
  let query = {_id:req.params.id}

  Article.remove(query, function(err){
    if(err){
      console.log(err)
    }
    res.send('Success')
  });
});
//Start Server
app.listen(3000, () => console.log('nodkb listening on port 3000!'))
