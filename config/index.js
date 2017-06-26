if(process.env.NODE_ENV !== "devServ"){
  require('dotenv').config()
};

module.exports = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  mongoUrl: process.env.MONGO_URL,
  redisOptions:{
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
  },
  sessionSecret: process.env.SESSION_SECRET
};
