var path = require('path'), env = {root_path:path.join(__dirname, '../..')};
env.site_path = env.root_path + '/site';

var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
var cfg0 = require(env.site_path + '/api/cfg/db.json');
var crowdProcess =  require(env.root_path + '/package/crowdProcess/crowdProcess');
var request = require(env.root_path + '/package/request/node_modules/request');	

var CP = new crowdProcess();
var _f = {};

_f['D0'] = function(cbk) {
	
	/* Pull root code if necessary */
	
	var exec = require('child_process').exec;
	var LOG = require(env.root_path + '/package/log/log.js');
	var log = new LOG();

	var cmd = 'cd ' + env.root_path + '/site && git pull';
	exec(cmd, function(error, stdout, stderr) {
	    	if (error) {
			log.write("/var/log/shusiou_cron.log", 'cron::'+cmd,  JSON.stringify(error));
		} else {
			log.write("/var/log/cron_git.log", 'git cron :: ' + cmd, stdout); 
		}
		cbk(cmd);
	});	
}

/* Pull monitor cloud nodes */
_f['D1'] = function(cbk) {
	var str = "SELECT * FROM `cloud_node`";
	var connection = mysql.createConnection(cfg0);
	connection.connect();
	connection.query(str, function (error, results, fields) {
		connection.end();
		if (error) {
			cbk(false);
		} else {
			cbk(results);
		}
	});	
}
_f['D2'] = function(cbk) {
	if  (CP.data.D1 == false) {  cbk(false); return true; }
	var CP1 = new crowdProcess();
	var _f1 = {}, recs = CP.data.D1;	
	for (var i = 0; i < recs.length; i++) {
		_f1['P_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].node_ip;
				request({
					url: 'http://'+ ip +'/api/node_audit.api?opt=status',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					var changeStatus = function(mark, space, cbk) {
						var a = [], audit = [], score = 0;
						try { if (recs[i].audit) a = JSON.parse(recs[i].audit); } catch(e) {}
		
						if (mark) audit[audit.length] = 1;
						else audit[audit.length] = 0;

						for (var j=0; j< a.length; j++) {
							if (j < 5) audit[audit.length] = a[j];
							else break;
						}
						for (var j=0; j < audit.length; j++) {
							if (audit[j]) score += Math.floor(Math.pow(10 - (j * 1), 8) * 0.00001);
						} 
						var connection = mysql.createConnection(cfg0);
						connection.connect();
						if (space === false) {
							var str = "UPDATE `cloud_node` SET `audit` = '" + JSON.stringify(audit) + 
						   	 "', `score` = '" + score + "', `updated` = NOW() WHERE `node_ip` = '" + ip + "'";
						} else {
							var str = "UPDATE `cloud_node` SET `audit` = '" + JSON.stringify(audit) + 
						   	 "', `score` = '" + score + "'," +
							 "`total_space` = '" + space.total + "'," +
							 "`free_space` = '" + space.free + "'," +
							 "`free` = '" + space.free_rate + "'," +
							 "`channel` = '" + space.channel + "'," +
							 "`updated` = NOW() " +    
							 " WHERE `node_ip` = '" + ip + "'";
						}
						connection.query(str, function (error, results, fields) {
							connection.end();
							if (error) {
								cbk(true);
							} else {
								cbk(true);
							}
						});						
					}
					
					if (error) {
						changeStatus(true, false, cbk1);
					} else {
						var v = {};
						try { v = JSON.parse(body); } catch(e) {}
						if (v.ip === ip) changeStatus(false, v.space, cbk1);
						else changeStatus(true, false, cbk1);
					}
				   });	
			}
		})(i);
	}
	
	CP1.parallel(
		_f1,
		function(data) {
			cbk(data);
		}, 10000
	);	
}

_f['D3'] = function(cbk) {
	if  (CP.data.D1 == false) {  cbk(false); return true; }
	
	var CP1 = new crowdProcess();
	var _f1 = {}, recs = CP.data.D1;	
	for (var i = 0; i < recs.length; i++) {
		_f1['P_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].node_ip;
				request({
					url: 'http://'+ ip +'/api/cron_watch.api',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					console.log('Called ' + 'http://'+ ip +'/api/cron_watch.api');
					console.log(body);
					cbk1(true);
				   });	
			}
		})(i);
	}
	
	CP1.parallel(
		_f1,
		function(data) {
			cbk(data);
		}, 10000
	);	
}

_f['D3_GIT'] = function(cbk) {
	if  (CP.data.D1 == false) {  cbk(false); return true; }
	
	var CP1 = new crowdProcess();
	var _f1 = {}, recs = CP.data.D1;	
	for (var i = 0; i < recs.length; i++) {
		_f1['P_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].node_ip;
				request({
					url: 'http://'+ ip +'/api/admin.api',
					headers: {
					    "content-type": "application/json"
					},
					data: {opt:'git_frame_pull'},
					timeout: 500
				    }, function (error, resp, body) { 
					console.log('Called ' + 'http://'+ ip +'/api/admin.api');
					console.log(body);
					cbk1(true);
				   });	
			}
		})(i);
	}
	
	CP1.parallel(
		_f1,
		function(data) {
			cbk(data);
		}, 10000
	);	
}
/* Pull monitor cloud server */
_f['E1'] = function(cbk) {
	var str = "SELECT * FROM `cloud_server`";
	var connection = mysql.createConnection(cfg0);
	connection.connect();
	connection.query(str, function (error, results, fields) {
		connection.end();
		if (error) {
			cbk(false);
		} else {
			cbk(results);
		}
	});	
}
_f['E3'] = function(cbk) {
	if  (CP.data.E1 == false) {  cbk(false); return true; }
	
	var CP1 = new crowdProcess();
	var _f1 = {}, recs = CP.data.E1;	
	for (var i = 0; i < recs.length; i++) {
		_f1['P_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].server_ip;
				request({
					url: 'http://'+ ip +'/api/cron_watch.api',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					console.log('Called ' + 'http://'+ ip +'/api/cron_watch.api');
					console.log(body);
					cbk1(true);
				   });	
			}
		})(i);
	}
	
	CP1.parallel(
		_f1,
		function(data) {
			cbk(data);
		}, 10000
	);	
}
CP.serial(
	_f,
	function(data) {
		
		process.stdout.write(JSON.stringify(data.results));
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
	}, 30000
);	

return true;
