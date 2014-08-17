(function() {
	var path = require('path'),
        fs = require('fs'),
	    spawn = require('child_process').spawn,
	    args = process.argv,
        nodePath = args[0],
	    currentPath = path.resolve(__dirname),
	    binPath = path.join(currentPath, 'bin'),
	    compatPath = path.join(currentPath, 'compat'),
	    env = process.env,
	    cwd = process.cwd(),
	    separator = ':',
        tempCwd, directories, commandPath, cmd;

    args = Array.prototype.slice.call(args, 2);

	if (path.existsSync(path.join(cwd, '.senchasdk')) && ['create', 'build', 'slice'].indexOf(args[0]) == -1) {
        commandPath = path.join(fs.readFileSync('.senchasdk', 'utf8').trim(), 'command');

	    env['NODE_PATH'] = path.join(commandPath, 'vendor', 'nodejs', 'node_modules');
	    args.unshift(path.join(commandPath, 'sencha.js'));
	    cmd = nodePath;
	}
	else {
        if ((args[0] == 'app' && args[1] == 'create') || (args[0] == 'generate' && args[1] == 'app')) {
            console.log("\033[31m\033[1m[ERROR] The current working directory ("+cwd+") is not a valid SDK directory. " +
                "Please 'cd' into a SDK directory before executing this command.\033[22m\033[39m");
        }
        else if (['app', 'fs', 'manifest', 'test', 'generate', 'package'].indexOf(args[0]) != -1) {
            console.log("\033[31m\033[1m[ERROR] The current working directory ("+cwd+") is not a recognized Sencha SDK " +
                "or application folder\033[22m\033[39m");
        }

        tempCwd = cwd;

        while (true) {
            directories = fs.readdirSync(tempCwd).filter(function(file) {
                return fs.statSync(path.join(tempCwd, file)).isDirectory();
            });

            if (directories.length == 1) {
                tempCwd = path.join(tempCwd, directories[0]);

                if (path.existsSync(path.join(tempCwd, '.senchasdk'))) {
                    console.log("\033[32m\033[1m[NOTICE] A valid SDK / application directory is detected at: " + path.join(tempCwd, fs.readFileSync(path.join(tempCwd, '.senchasdk'), 'utf8').trim()) + "\033[22m\033[39m");
                    break;
                }
            }
            else {
                break;
            }
        }

        if (process.platform == 'win32') {
            separator = ';';
        }

        env.PATH = [
            path.join(binPath),
            path.join(compatPath, 'jsbuilder'),
            env.PATH
        ].join(separator);

        args = ['-path', path.join(compatPath, 'command'), path.join(compatPath, 'command', 'sencha.js')].concat(args);
        cmd = path.join(binPath, 'jsdb');
	}

	cmd = spawn(cmd, args, {
	    env: env
	});

	cmd.stdout.on('data', function(data) {
	    console.log(data.toString('utf8').trim());
	});


	cmd.stderr.on('data', function(data) {
	    console.log(data.toString('utf8').trim());
	});

})();
