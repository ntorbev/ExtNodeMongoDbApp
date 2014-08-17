Modules.GenerateLocale = Ext.extend(Module, {
    name: 'Locale File Builder',
    cmdName: 'create locale',
    description: [
        'Sencha\'s Locale Builder allows you to generate a default locale file that includes all localized settings from your code. ',
        'The builder interrogates your project build file to extract the required locale information and build the locale template.\n\n ',

        'Example:\n',
        '   sencha create locale -p ~/path/to/your/app.jsb3 -t ~/locale.js\n'
    ].join(''),
    shortDescription: 'generate a template locale file from source',

    constructor: function() {
        var rootPath = system.script.match(/^(.*)(?:\/|\\)command(?:\/|\\)sencha\.js$/)[1],
            scriptPath = rootPath + Fs.sep + 'scripts' + Fs.sep + 'phantomjs-locale.js';

        this.cmd = "phantomjs " + scriptPath;
        
        Modules.GenerateLocale.superclass.constructor.call(this);
        this.cli.add({
            name: 'projectFile',
            alias: 'p',
            description: 'The file path of the jsb3 project file',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'target',
            alias: 't',
            description: 'The target for the newly generated locale file',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'verbose',
            alias: 'v',
            description: 'Display detailed output',
            attrs: CliOptionAttr.NoValue
        });

        if (Platform.isWindows) {
            this.cmdIsBatch = true;
        }
    }
});
new Modules.GenerateLocale();