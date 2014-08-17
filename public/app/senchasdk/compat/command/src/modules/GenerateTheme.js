Modules.GenerateTheme = Ext.extend(Module, {
    name: 'Theme Slicer',
    cmd: 'ext-theme',
    cmdName: 'slice theme',
    description: [
        'The Sencha Theme Slicer allows you to take your custom theme and slice up images for browsers that do not support ',
        'border radii or linear gradients. This is the case for IE 6-8.\n\n',

        'Example:\n',
        '   sencha slice theme -d ~/ext-4.0 -c mytheme.css -o mytheme -v\n'
    ].join(''),
    shortDescription: 'slice a custom theme\'s images for IE',

    constructor: function() {
        Modules.GenerateTheme.superclass.constructor.call(this);
        this.cli.add({
            name: 'css',
            alias: 'c',
            description: 'The path to your theme\'s complete CSS file, e.g., ext-all-access.css. Uses the default Ext JS 4 theme CSS if not provided.',
            attrs: CliOptionAttr.ValueRequired,
            validator: function(value) {
                return Fs.exists(value);
            }
        }).add({
            name: 'ext-dir',
            alias: 'd',
            description: 'The path to the root of your Ext JS 4 SDK directory.',
            attrs: CliOptionAttr.Required,
            validator: function(value) {
                return Fs.exists(value + Fs.sep + 'ext-all-debug.js');
            }
        }).add({
            name: 'manifest',
            alias: 'm',
            description: 'The path to your Theme Generator JSON manifest file, e.g., manifest.json. Uses the default packaged manifest if not provided.',
            attrs: CliOptionAttr.ValueRequired,
            validator: function(value) {
                return Fs.exists(value);
            }
        }).add({
            name: 'output-dir',
            alias: 'o',
            description: 'The destination path to save all generated theme images. Defaults to the current working directory.',
            attrs: CliOptionAttr.ValueRequired
        }).add({
            name: 'verbose',
            alias: 'v',
            description: 'Display a message for every image that is generated,',
            attrs: CliOptionAttr.NoValue
        });
    }
});
new Modules.GenerateTheme();
