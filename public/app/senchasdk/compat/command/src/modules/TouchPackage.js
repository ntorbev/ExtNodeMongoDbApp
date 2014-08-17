Modules.TouchPackage = Ext.extend(Module, {
    name: 'Sencha Touch App Packager',
    cmd: 'stbuild',
    cmdName: 'package',
    description: [
        'The Sencha Touch App Packager allows you to package your Sencha Touch application into a native application bundle ',
        'that is ready to run in a simulator or on a mobile device.\n\n',

        'Example:\n',
        '   # Generate a packager JSON config template\n',
        '   sencha package generate myconfig.json\n\n',

        '   # Package your application according to your config\n',
        '   sencha package myconfig.json\n\n',

        '   # Package and run your application in one step\n',
        '   sencha package run myconfig.json\n'
    ].join(''),
    shortDescription: 'package your Touch web app into a native bundle',

    constructor: function() {
        Modules.TouchPackage.superclass.constructor.call(this);
        this.cli.add({
            name: 'generate',
            alias: 'g',
            noDashes: true,
            description: 'Generate a template packager config file.',
            attrs: CliOptionAttr.NoValue
        }).add({
            name: 'run',
            alias: 'r',
            noDashes: true,
            description: 'Package and run your application in one step.',
            attrs: CliOptionAttr.NoValue
        });
    },

    getOptionsText: function() {
        return '[generate|run] CONFIG_FILE';
    },
    
    run: function() {
        var cmd = [this.getCmd()],
            cli = this.cli,
            configPath = cli.bucket.shift(),
            generate = cli.get('g').toggled,
            run = cli.get('r').toggled;
        
        if (!configPath) {
            this.printUsage();
            return;
        }

        if (!generate && !Fs.exists(configPath)) {
            writeln('The specified config file "' + configPath + '" does not exist.');
            return;
        }

        if (generate) {
            cmd.push(' generate ' + configPath);
        } else if (run) {
            cmd.push(' run ' + configPath);
        } else {
            cmd.push(' package ' + configPath);
        }

        Cmd.execute(cmd.join(''));
    }
});
new Modules.TouchPackage();
