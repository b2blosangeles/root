/* --- code for cron watch ---*/
(function(){
    var path = require('path');
    var env = {root_path:path.join(__dirname, '../..')};
    env.site_path = env.root_path + '/site';
    var request =  require(env.root_path + '/package/request/node_modules/request');
    var fs = require('fs');

    var watch0 = {start:new Date(), mark:new Date()};
    fs.readFile('/var/.qalet_cron_watch.data', 'utf8', function(err,data) {
      if (err){
          fs.writeFile('/var/.qalet_cron_watch.data', JSON.stringify(watch0), function (err) {});
      } else {
        var watch = {};
        try { watch = JSON.parse(data);} catch (e) {}
        if (watch.mark)  {
          delete watch.start;
          watch.mark = new Date();
          fs.writeFile('/var/.qalet_cron_watch.data', JSON.stringify(watch), function (err) {
              console.log(watch);
          });
        } 
      }
    });	 
})();

