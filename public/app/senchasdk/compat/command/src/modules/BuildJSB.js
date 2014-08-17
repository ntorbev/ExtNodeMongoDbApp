Modules.BuildJSB = Ext.extend(Module, {
    name: 'JS Builder',
    cmd: 'JSBuilder',
    cmdName: 'build',
    description: [
        'JS Builder makes deploying JavaScript projects easy with code consolidation, obfuscation, and minification all in one step.\n\n',

        'Example:\n',
        '   sencha build -p /home/tommy/www/trunk/ext.jsb3 -d /home/tommy/www/deploy/\n'
    ].join(''),
    shortDescription: 'build a JSB project',

    constructor: function() {
        var rootPath = system.script.match(/^(.*)(?:\/|\\)command(?:\/|\\)sencha\.js$/)[1];

        this.cmd = rootPath + Fs.sep + "jsbuilder" + Fs.sep + "JSBuilder";

        if (Platform.isWindows) {
            this.cmd = "\"" + this.cmd + ".bat\"";
        }

        Modules.BuildJSB.superclass.constructor.call(this);
        this.cli.add({
            name: 'projectFile',
            alias: 'p',
            description: 'Location of a jsb3 project file',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'deployDir',
            alias: 'd',
            description: 'The direction to build the project to',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'verbose',
            alias: 'v',
            description: 'Output detailed information about what is being built',
            attrs: CliOptionAttr.NoValue
        }).add({
            name: 'debugSuffix',
            alias: 's',
            description: 'Suffix to append to JS debug targets, defaults to \'-debug\'',
            attrs: CliOptionAttr.ValueRequired,
            defaultValue: '-debug'
        }).add({
            name: 'nocompress',
            alias: 'c',
            description: 'Don\'t compress the targets',
            attrs: CliOptionAttr.NoValue
        });
    }
});
new Modules.BuildJSB();
