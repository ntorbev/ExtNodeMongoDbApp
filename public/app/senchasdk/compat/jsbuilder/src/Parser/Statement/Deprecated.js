Loader.require('Parser.Statement.If');

Parser.Statement.Deprecated = Ext.extend(Parser.Statement.If, {
    constructor: function() {
        var since, product;
        
        Parser.Statement.Deprecated.superclass.constructor.apply(this, arguments);

        since = this.getProperty('since');
        product = this.getProperty('product');
        
        this.removeProperty('since');
        
        if (since == null) {
            this.setProperty('deprecated', 'true');
            return this;
            // throw new Error("[Parser.Statement.Deprecated] 'since' property is required for deprecated statement");
        }
        
        if (product != null) {
            if (Parser.evaluate('product', '=' + product)) {
                this.removeProperty('product');
            }
            else {
                this.setProperty('product', '!' + product);
                return;
            }         
        }
        this.setProperty('minVersion', '<=' + since);
    }
});
