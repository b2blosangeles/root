if (!req.query['opt']) {
	res.send('Missing opt parpmeter error');
	return true;
}
switch(req.query['opt']) {
		
    case 'git_frame_pull':
	pkg.exec('cd ' + env.root_path + '&& git pull', function(error, stdout, stderr) {
		 res.send(stdout);
	});
        break;
		
    case 'git_site_pull':
	pkg.exec('cd ' + env.site_path + '&& git pull', function(error, stdout, stderr) {
		 res.send(stdout);
	});
        break;	
		
    case 'reboot':	
	pkg.exec('shutdown -r +1', function(error, stdout, stderr) {
	 	res.send('Server will be reboot in 1 minute!');
	});
	break;
		
    default:
	res.send('Wrong opt parpmeter!!');
	return true;
}
