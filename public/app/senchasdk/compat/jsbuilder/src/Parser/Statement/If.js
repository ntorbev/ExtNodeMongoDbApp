Parser.Statement.If = Ext.extend(Parser.Statement, {
    satisfied: false,

    evaluate: function() {
        var ret = true, n;

        for (n in this.properties) {
            if (!Parser.evaluate(n, this.properties[n])) {
                ret = false;
                Logger.log('[DEBUG][Parser.Statement.If#evaluate] ' + ret + ' because "' + Parser.params[n] + '" doesn\'t evaluate to "' + this.properties[n] + '"');
                break;
            }
        }

        return (this.isInverted ? !ret : ret);
    },

    parse: function(stream) {
        if (this.evaluate()) {
            this.satisfied = true;
        }

        Parser.Statement.If.superclass.parse.apply(this, arguments);

        if (!this.satisfied) {
            return '';
        }

        return this.buffer;
    },

    onSubStatement: function(statement, stream) {
        var parsed = statement.parse(stream),
            satisfied = false;

        if (statement.type === 'elseif') {
            if (!this.satisfied) {
                if (statement.evaluate()) {
                    this.satisfied = true;
                    satisfied = true;
                }
            }
        } else if (statement.type === 'else') {
            if (!this.satisfied) {
                this.satisfied = true;
                satisfied = true;
            }
        } else {
            this.pushBuffer(parsed);
            return;
        }

        if (satisfied) {
            this.resetBuffer();
            this.pushBuffer(parsed);
        }
    }
});
