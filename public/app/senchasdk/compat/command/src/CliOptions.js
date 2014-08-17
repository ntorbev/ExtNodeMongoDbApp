CliOptions = Ext.extend(Object, {
    constructor: function() {
        this.options = {};
        this.bucket = [];
    },

    add: function(opt) {
        var opts = this.options,
            name = opt.name;

        if (!opts[name]) {
            opt = opts[name] = Ext.take(opt, ['name', 'alias', 'description', 'attrs', 'defaultValue', 'validator', 'noDashes']);
            if (this.testAttr(opt, CliOptionAttr.Required) && !this.testAttr(opt, CliOptionAttr.ValueOptional)) {
                opt.attrs |= CliOptionAttr.ValueRequired;
            }
            opt.getValue = function() {
                return this.value || this.defaultValue;
            };
        }

        return this;
    },

    get: function(name) {
        var opts = this.options,
            opt;

        for (var key in opts) {
            if (opts.hasOwnProperty(key)) {
                opt = opts[key];
                if (opt.name === name || opt.alias === name) {
                    return opt;
                }
            }
        }

        return null;
    },

    hasOptions: function() {
        for (var key in this.options) {
            if (this.options.hasOwnProperty(key)) {
                return true;
            }
        }

        return false;
    },

    isValid: function() {
        var me = this,
            opts = this.options,
            opt,

            isValid = function() {
                if (!opt.toggled && me.testAttr(opt, CliOptionAttr.Required)) {
                    return false;
                }

                if (opt.toggled) {
                    if (me.testAttr(opt, CliOptionAttr.ValueRequired) && Ext.isEmpty(opt.value)) {
                        return false;
                    }

                    if (me.testAttr(opt, CliOptionAttr.NoValue) && !Ext.isEmpty(opt.value)) {
                        return false;
                    }

                    if (opt.validator && !opt.validator.call(me, opt.value)) {
                        return false;
                    }
                }

                return true;
            };

        for (var key in opts) {
            if (opts.hasOwnProperty(key)) {
                opt = opts[key];
                if (!isValid()) {
                    return false;
                }
            }
        }

        return true;
    },

    parse: function(args) {
        args = args || system.arguments;

        var switchTestRe = /^-{1,2}[^-]/,
            dashSwitchRe = /^-(\w)$/,
            dashMultiSwitchRe = /^-(\w+)$/,
            dblDashSwitchRe = /^--(\w+)$/,
            switchWithValueRe = /^--(\w+)=(.*)$/,
            len = args.length,
            i = 0,
            opt = null,
            inOption = false,
            arg, match;

        for(; i < len, arg = args[i]; i++) {
            if (opt !== null) {
                opt.toggled = true;

                if (inOption && !arg.match(switchTestRe)) {
                    opt.value = arg;
                    opt = null;
                    continue;
                }
            }

            inOption = false;

            if ((match = arg.match(dashSwitchRe))
                || (match = arg.match(dblDashSwitchRe))
                || (opt = this.get(arg))) {
                if (match) {
                    opt = this.get(match[1]);
                }
                if (!this.testAttr(opt, CliOptionAttr.NoValue)) {
                    inOption = true;
                }
            } else if (match = arg.match(switchWithValueRe)) {
                opt = this.get(match[1]);
                if (opt) {
                    opt.value = match[2];
                }
                opt = null;
            } else if (match = arg.match(dashMultiSwitchRe)) {
                match[1].split('').forEach(function(a) {
                    opt = this.get(a);
                    if (opt) {
                        opt.toggled = true;
                    }
                });
                opt = null;
            } else {
                this.bucket.push(arg);
            }
        }

        if (opt !== null) {
            opt.toggled = true;
        }

        return this;
    },

    printUsage: function() {
        var opts = this.options,
            keys = [],
            names = [],
            descs = [],
            i = 0,
            opt, len, name, valueOptional,
            takesValue, line, words;

        for (var key in opts) {
            if (opts.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        keys.sort();
        for (len = keys.length; i < len; i++) {
            opt = opts[keys[i]];
            valueOptional = this.testAttr(opt, CliOptionAttr.ValueOptional),
            takesValue = !this.testAttr(opt, CliOptionAttr.NoValue);

            name = (opt.noDashes ? '  ' : '--') + opt.name;
            name += (takesValue ? '[=]' + (valueOptional ? '[value]' : 'value') : '');
            if (opt.alias) {
                name += ', -' + opt.alias + (takesValue ? '[=]' + (valueOptional ? '[value]' : 'value') : '');
            }
            if (this.testAttr(opt, CliOptionAttr.Required)) {
                name += ' (required)';
            }

            names.push(name);
            descs.push(opt.description);
        }

        for (i = 0, len = names.length; i < len; i++) {
            writeln(' ' + names[i]);
            line = '   ';
            words = descs[i].split(' ');

            words.forEach(function(word) {
                if (!word) {
                    return;
                }

                if (line.length + word.length >= 80) {
                    writeln(line);
                    line = '   ';
                }
                line += word + ' ';
            });

            writeln(line);
            writeln();
        }

        return this;
    },

    testAttr: function(option, attr) {
        return (option.attrs & attr) === attr;
    }
});

CliOptionAttr = {
    NoValue: 1,             // No value, just a toggle
    ValueOptional: 2,       // Value is optional
    ValueRequired: 4,       // Value must be provided when toggled
    Required: 8,            // Option must be provided, period
    Undocumented: 16        // Option should not be shown in usage statement
};

