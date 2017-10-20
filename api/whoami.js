var v = req.body.ip;
if (!v) {
	res.send({error:'Missing ip'});
	return true;
} 

/*
function isIp(ip) {
    var arrIp = ip.split(".");
    if (arrIp.length !== 4) return "Invalid IP";
    for (let oct of arrIp) {
        if ( isNaN(oct) || Number(oct) < 0 || Number(oct) > 255)
            return false;
    }
    return true;
}
*/

var CP = new pkg.crowdProcess();
var _f = {};

for (var i = 0; i < v.length; i++) {
	_f[i] = (function(i) {
		return function(cbk) {
			pkg.request({
				url: 'http://'+v[i]+'/checkip/',
				headers: {
				    "content-type": "application/json"
				}
			    }, function (error, resp, body) { 
              cbk('NIU2');
			   });
		}	
	})(i);
}


CP.parallel(
	_f,
	function(data) {
		res.send(data);
	},
	30000
);
