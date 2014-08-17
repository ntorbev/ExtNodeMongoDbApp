var scriptPath = system.script.replace('sencha.js', '');
load('src/Loader.js');
Loader.setBasePath(scriptPath + '/src');
Loader.setBasePath('Modules', '/modules');
Loader.require([
    'Ext', 'Cmd', 'Filesystem', 'Platform', 'Logger', 'CliOptions',
    'Module', 'Modules.GenerateTheme', 'Modules.GenerateJSB', 'Modules.BuildJSB',
    'Modules.GenerateBootstrapData', 'Modules.GenerateManifest', 'Modules.GenerateLocale'
]);

Loader.require('Modules.TouchPackage');


(function() {
    var args = system.arguments,
        len = args.length,
        mods = Module.modules,
        cmd = '',
        isHelp = false,
        arg, mod;

    if (!len || (len === 1 && (args[0] === 'help' || args[0] === '--help' || args[0] === '-v' || args[0] === '--version'))) {
        Module.printUsage();
        return;
    }

    for (var i = 0; i < len, arg = args[i]; i++) {
        if (i === 0 && arg === 'help') {
            isHelp = true;
            continue;
        }

        cmd += arg;
        if (mod = mods[cmd]) {
            if (isHelp || !mod.getCliOptions().parse(args.slice(i + 1)).isValid()) {
                mod.printUsage();
            } else {
                mod.run();
            }
            break;
        }
        cmd += ' ';
    }
})();
