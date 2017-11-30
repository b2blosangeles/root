/* ---  reboot servers from root server */
function isIp(ip) {
    var arrIp = ip.split(".");
    if (arrIp.length !== 4) return false;
    for (let oct of arrIp) {
        if ( isNaN(oct) || Number(oct) < 0 || Number(oct) > 255)
            return false;
    }
    return true;
}

if (!req.query['opt']) {
	res.send('Missing opt parpmeter error');
	return true;
}
var opt = req.query['opt'];

var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
var config = require(env.config_path + '/config.json');
var cfg_db = config.db;

var CP = new pkg.crowdProcess();
var _f = {};
if (opt == 'node' || opt == 'all') {
	_f['D1'] = function(cbk) {
		var str = "SELECT * FROM `cloud_node`";
		var connection = mysql.createConnection(cfg_db);
		connection.connect();
		connection.query(str, function (error, results, fields) {
			connection.end();
			if (error) {
				cbk(false);
			} else {
				cbk(results);
			}
		});	
	};
	_f['D2'] = function(cbk) {
		if  (CP.data.D1 == false) {  cbk(false); return true; }

		var CP1 = new pkg.crowdProcess();
		var _f1 = {}, recs = CP.data.D1;	
		for (var i = 0; i < recs.length; i++) {
			/* --- rebooting */
			_f1['reboot_'+i] = (function(i) {
				return function(cbk1) {
					var ip = recs[i].node_ip;
					pkg.request({
						url: 'http://'+ ip +'/api/admin.api',
						method: 'POST',
						headers: {
						    "content-type": "application/json"
						},
						form: {opt:'reboot'},
						timeout: 3000
					    }, function (error, resp, body) { 
						cbk1(body);
					   });							
				}
			})(i);		
		}

		CP1.parallel(
			_f1,
			function(data) {
				cbk(data);
			}, 3100
		);	
	};
}
if (opt == 'master' || opt == 'all') {
	_f['M1'] = function(cbk) {
		var str = "SELECT * FROM `cloud_server`";
		var connection = mysql.createConnection(cfg_db);
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
	_f['M2'] = function(cbk) {
		if  (CP.data.M1 == false) {  cbk(false); return true; }

		var CP1 = new pkg.crowdProcess();
		var _f1 = {}, recs = CP.data.M1;	
		for (var i = 0; i < recs.length; i++) {
			/* --- rebooting */
			_f1['reboot_'+i] = (function(i) {
				return function(cbk1) {
					var ip = recs[i].server_ip;
					pkg.request({
						url: 'http://'+ ip +'/api/admin.api',
						method: 'POST',
						headers: {
						    "content-type": "application/json"
						},
						form: {opt:'reboot'},
						timeout: 3000
					    }, function (error, resp, body) { 
						cbk1(body);
					   });							
				}
			})(i);		
		}

		CP1.parallel(
			_f1,
			function(data) {
				cbk(data);
			}, 3100
		);	
	};
}
if (opt == 'root' || opt == 'all') {
	_f['ROOT'] = function(cbk) {
		pkg.exec('shutdown -r +1', function(error, stdout, stderr) {
			cbk('Server will be reboot in 1 minute!');
		});		
	}	
}

if (isIp(opt)) {
	_f['SVR'] = function(cbk) {
		var ip = opt;
		pkg.request({
			url: 'http://'+ ip +'/api/admin.api',
			method: 'POST',
			headers: {
			    "content-type": "application/json"
			},
			form: {opt:'reboot'},
			timeout: 3000
		    }, function (error, resp, body) { 
			cbk(body);
		   });			
	}	
}

CP.serial(
	_f,
	function(data) {
		res.send(data.results);
	},
	6000
);

