Modules.GenerateManifest = Ext.extend(Module, {
    name: 'Generate JSON Manifest for all found Ext classes within the given directories',
    cmdName: 'create manifest',
    description: 'Generate classes manifest',
    shortDescription: 'generate classes manifest',

    constructor: function() {
        Modules.GenerateManifest.superclass.constructor.call(this);

        this.cli.add({
            name: 'source',
            alias: 's',
            description: 'The paths to all directories that contain JavaScript source files to scan, comma-separated',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'ignore',
            alias: 'i',
            description: 'The list of all files / folders to be ignored',
            attrs: CliOptionAttr.ValueOptional
        }).add({
            name: 'output',
            alias: 'o',
            description: 'The file path to write the JSON content to, defaults to stdout if none given',
            attrs: CliOptionAttr.ValueOptional
        });
    },

    run: function() {
        var options = this.cli.options,
            source = options.source.getValue(),
            ignore = options.ignore.getValue() || '',
            output = options.output.getValue() || '',
            rootPath = system.script.match(/^(.*)(?:\/|\\)command(?:\/|\\)sencha\.js$/)[1],
            scriptPath = rootPath + Fs.sep + 'scripts' + Fs.sep + 'hammerjs-manifest.js',
            cmd = "hammerjs " + scriptPath + " " + source + " " + ignore + " " + output,
            manifest = '';

        Cmd.execute(cmd);
    }
});

new Modules.GenerateManifest();
