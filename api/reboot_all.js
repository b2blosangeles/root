var mysql = require(env.site_path + '/api/inc/mysql/node_modules/mysql');
var config = require(env.config_path + '/config.json');
var cfg_db = config.db;

var CP = new pkg.crowdProcess();
var _f = {};

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
}
_f['D2'] = function(cbk) {
	if  (CP.data.D1 == false) {  cbk(false); return true; }
	
	var CP1 = new pkg.crowdProcess();
	var _f1 = {}, recs = CP.data.D1;	
	for (var i = 0; i < recs.length; i++) {
		/* --- git pull code */
		_f1['PGIT_'+i] = (function(i) {
			return function(cbk1) {
				var ip = recs[i].node_ip;
				var delay = randomInt(0,300) * 10;
				setTimeout(
					function() {
						request({
							url: 'http://'+ ip +'/api/admin.api',
							method: 'POST',
							headers: {
							    "content-type": "application/json"
							},
							form: {opt:'git_all_pull'},
							timeout: 5900
						    }, function (error, resp, body) { 
							console.log('Called ' + 'http://'+ ip +'/api/admin.api');
							if (error) console.log(error.message);
							if (body) console.log(body);
							cbk1(true);
						   });	
					}, delay
				      );						
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
		res.send(data);
	},
	10000
);

