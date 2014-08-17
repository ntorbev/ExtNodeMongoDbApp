Loader.require('Parser.Statement.If');

Parser.Statement.Feature = Ext.extend(Parser.Statement.If, {
    constructor: function() {
        Parser.Statement.Feature.superclass.constructor.apply(this, arguments);

        var properties = this.properties,
            name;

        for (name in properties) {
            if (properties.hasOwnProperty(name)) {
                this.setProperty(name, '!no');
            }
        }
    }
});
