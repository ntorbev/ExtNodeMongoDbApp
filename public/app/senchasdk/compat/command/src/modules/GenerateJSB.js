Modules.GenerateJSB = Ext.extend(Module, {
    name: 'Application JSB Builder',
    cmdName: 'create jsb',
    description: [
        'Sencha\'s Application JSB Builder allows you to compile a custom, minimal JSB project tailored to your application. ',
        'The generated jsb3 file will only package and minify the exact Ext JS 4 classes needed to run your application, yielding ',
        'the smallest build possible.\n\n',

        'Example:\n',
        '   sencha create jsb -a ~/path/to/your/app.html -p ~/myapp.jsb3\n',
        '   sencha create jsb -a http://localhost/~jarred/myapp -p ~/myapp.jsb3\n'
    ].join(''),
    shortDescription: 'generate a minimal JSB project for an app',

    constructor: function() {
        var rootPath = system.script.match(/^(.*)(?:\/|\\)command(?:\/|\\)sencha\.js$/)[1],
            scriptPath = rootPath + Fs.sep + 'scripts' + Fs.sep + 'phantomjs-jsb.js';

        this.cmd = 'phantomjs "' + scriptPath + '"',

        Modules.GenerateJSB.superclass.constructor.call(this);

        this.cli.add({
            name: 'app-entry',
            alias: 'a',
            description: 'The file or URL path to your application\'s HTML entry point',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'project',
            alias: 'p',
            description: 'The file path of the jsb3 project file to add Ext JS 4 classes',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'target',
            alias: 't',
            description: 'The JSB build target in the project to add Ext JS 4 classes. Defaults to the first build target found.',
            attrs: CliOptionAttr.ValueRequired
        }).add({
            name: 'verbose',
            alias: 'v',
            description: 'Display detailed output',
            attrs: CliOptionAttr.NoValue
        });
    }
});
new Modules.GenerateJSB();
