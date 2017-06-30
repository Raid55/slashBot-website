var express = require('express');
var router = express.Router();

router.get("/", isAuthenticated, latestServers, (req, res) => {
  res.render('../views/dashboard.pug', { userObj: req.user[0], servers: req.user[0].servers})
});

router.get("/:servId", isAuthenticated, (req, res) => {

  let selectedServ = req.user[0].servers.reduce((accu,el,indx) => {
    if(el.id === req.params.servId){
      accu = el;
    }
    return accu;
  }, null);
  if(selectedServ){
    Servers.findOrCreate({id: selectedServ.id},{
      icon: selectedServ.icon,
      name: selectedServ.name,
      ownerid: req.user[0].id,
      isOn: false,
      mods:{}
    },(err, selecServer) => {
      if(!err){
        res.render(__dirname+'/views/dashboard.pug', {userObj: req.user[0], servers: req.user[0].servers, selectedServ: selecServer});
      }else{
        console.log(err, " there is an error on /dashboard/id");
        res.render("home/homeLoggedIn.pug", {userObj: req.user[0]});
      }
    });
  }else{
    console.log("no selected serv");
    res.render("home/homeLoggedIn.pug", {userObj: req.user[0]});
  }
});

module.exports = router;
