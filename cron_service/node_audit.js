var path = require('path'), env = {root_path:path.join(__dirname, '../..')};
env.site_path = env.root_path + '/site';

var mysql = require(env.site_path + '/site/api/inc/mysql/node_modules/mysql');
var cfg0 = require(env.site_path + '/site/api/cfg/db.json');
var crowdProcess =  require(env.root_path + '/package/crowdProcess/crowdProcess');
var request =  require(env.root_path + '/package/request/request');	

var CP = crowdProcess();
var _f = {};

_f['D1'] = function(cbk) {
	var str = "SELECT * FROM `cloud_node`";
	var connection = mysql.createConnection(cfg0);
	connection.connect();
	connection.query(str, function (error, results, fields) {
		connection.end();
		if (error) {
			cbk(false);
			CP.exit = 1;
		} else {
			cbk(results);
		}
	});	
}
_f['D2'] = function(cbk) {
	var CP1 = crowdProcess();
	var _f1 = {}, recs = CP.data.D1;	
	for (var i = 0; i < recs.length; i++) {
		_f1['P_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].node_ip;
				request({
					url: 'http://'+ ip +'/checkip/',
					headers: {
					    "content-type": "application/json"
					},
					timeout: 500
				    }, function (error, resp, body) { 
					if (error) {
						cbk1(false);
					} else {
						var v = [];
						try { v = JSON.parse(body); } catch(e) {}
						if (v.indexOf(ip) == -1) cbk1(true);
						else {
							var a, audit = [], score = 0;
							try { if (recs[i].audit) a = JSON.parse(recs[i].audit); } catch(e) {}
							a[a.length] = new Date().getTime();
							a.reverse();
							for (var j=0; j<a.length; j++) {
								if ((new Date().getTime() - a[j]) < 60000) audit[audit.length] = a[j];
							}
							for (var j=0; j < audit.length; j++) {
								if (audit[j] && j < 10) score += (10-j);
							}
							var connection = mysql.createConnection(cfg0);
							connection.connect();
							var str = "UPDATE `cloud_node` SET `audit` = '" + JSON.stringify(audit) + 
							    "', `score` = '" + score + "' WHERE `node_ip` = '" + ip + "'";
							connection.query(str, function (error, results, fields) {
								connection.end();
								if (error) {
									cbk1(true);
								} else {
									cbk1(false);
								}
							});
						}	
					}
				   });	
			}
		})(i);
	}
	
	CP1.parallel(
		_f1,
		function(data) {
			cbk(data);
		}, 2000
	);	
}
CP.serial(
	_f,
	function(data) {
		log.write("/var/log/shusiou_cron.log", 'cron::node_audit',  JSON.stringify(data.results));
	}, 3000
);	
 
return true;
