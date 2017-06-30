const cors = require('cors');
const path = require('path');
const axios = require('axios');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const OAuth2Strategy = require('passport-oauth2').Strategy;

const { mongoUrl, clientId, clientSecret, sessionSecret } = require('./config');
const userSchema = require('./models/user.js');
const serverSchema = require('./models/server.js')
//express app
const app = express();


//for dev
app.use(cors())

//mongoose connection
const connection = mongoose.createConnection(mongoUrl)
const Users = connection.model('User', userSchema)
const Servers = connection.model('Servers', serverSchema)

// Serve static assets
app.use('/files',express.static(__dirname+'/public'));

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//session
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: connection })
}));

//passport init and session
app.use(passport.initialize());
app.use(passport.session());

//View Engine...aka PUG
app.set('view engine', 'pug')

//pasport oauth2 strategy
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://discordapp.com/api/oauth2/authorize?scope',
    tokenURL: 'https://discordapp.com/api/oauth2/token',
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: "http://67.205.140.33:5555/confirm_login"
  },
  (accessToken, refreshToken, profile, cb) => {
    axios.request({
      url: 'https://discordapp.com/api/users/@me',
      method: 'get',
      headers: {'Authorization': `Bearer ${accessToken}`},
    })
    .then(response => {
      Users.findOrCreate({id: response.data.id}, {
        username: response.data.username,
        avatar: `https://cdn.discordapp.com/avatars/${response.data.id}/${response.data.avatar}.jpg`,
        discriminator: response.data.discriminator,
        mfa_enabled: response.data.mfa_enabled,
        session:{
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      }, (err, user) => {
        return cb(err, user);
      });
    })
    .catch(error => {
      console.log(error);
      return cb(error)
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.find({id: id}, (err, user) => {
    done(err, user);
  });
});

//Morgan Logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));


//renegade middleware
function isAuthenticated(req,res,next){
   if(req.user)
      next();
   else
     res.redirect('/');

}

function latestServers(req, res, next){
  axios.request({
    url: 'https://discordapp.com/api/users/@me/guilds',
    method: 'get',
    headers: {'Authorization': `Bearer ${req.user[0].session.accessToken}`},
  })
  .then(response => {
    return response.data.reduce((accu, el, indx) =>{
      if(el.owner){
        accu.push({id: el.id, icon:` https://cdn.discordapp.com/icons/${el.id}/${el.icon}.jpg`, name: el.name})
      }
      return accu
    }, [])
  })
  .then(response => {
    Users.update({id: req.user[0].id}, { $set: { servers: response}}, (err, user) => {
      next();
    });
  })
  .catch(error => {
    console.log(error, " this ererororo");
    next();
  });
}

//Home
app.get("/", (req, res) => {
  res.render(__dirname+"/views/home.pug", req.user ? {userObj: req.user[0]} : null)
});

//Dashboard
const dashboardRouter = require('./routes/dashboard.js')
app.use('/dashboard', dashboardRouter)

//Discord Login (redirects to /dashboard on login)
app.get("/login", passport.authenticate('oauth2',{scope: ["identify", "guilds"]}))

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get("/confirm_login", passport.authenticate('oauth2', { failureRedirect: '/' }), (req,res) => {
  console.log("lol???")
  res.redirect("/dashboard")
})

//API
//Here what I decided to do is make an API that abstracts my mongodb and sends all info to redis cache on the bot
//this is gonna be cool, the endpoint will be /api naturaly, or maybe get fancy and choose something like /dataHole lolololoollollooloolololol
app.post("/dashboard/:servId/on", isAuthenticated, (req, res) => {
  let doesHeOwn = req.user[0].servers.reduce((accu, el, indx) => {
    if(el.id === req.params.servId){
      accu = true;
    }
    return accu;
  }, false);
  if(doesHeOwn){
    Servers.update({id: req.params.servId},{ $set: { isOn: true }}, (err, user) => {
      if(err){
        res.sendStatus(401)
        console.log(err, " there is a problem turning on a server");
      }else{
        res.sendStatus(201)
      }
    })
  }else{
    res.sendStatus(401)
    console.log(req.user[0].id, " just tried to turn on/off a server without being the owner ")
  }
})

app.post("/dashboard/:servId/off", isAuthenticated, (req, res) => {
  let doesHeOwn = req.user[0].servers.reduce((accu, el, indx) => {
    if(el.id === req.params.servId){
      accu = true;
    }
    return accu;
  }, false);
  if(doesHeOwn){
    Servers.update({id: req.params.servId},{ $set: { isOn: false }}, (err, user) => {
      if(err){
        res.sendStatus(401)
        console.log(err, " there is a problem turning on a server");
      }else{
        res.sendStatus(201)
      }
    })
  }else{
    res.sendStatus(401)
    console.log(req.user[0].id, " just tried to turn on/off a server without being the owner ")
  }
})

//TEST
app.get("/test1", isAuthenticated, (req, res) => {
  res.render('dashboard/noServDash.pug', { userObj: req.user[0]})
})

app.get("/test2", (req, res) => {

  res.json(req.session)
})

app.get("/test3", (req, res) => {
  res.json(req.session.cookie)
})

app.get("/test4", (req, res) => {
  res.json(req.user)
})

// passport.authenticate('oauth2',{scope: ["identify", "guilds"]})


// app
//   .get("/api/servers", (req, res) => {
//
//   })
//   .post("/api/dashboard/:servId", (req, res) => {
//
//   })

module.exports = app;
