Module = Ext.extend(Object, {
    constructor: function() {
        this.cli = new CliOptions();
        Module.modules[this.cmdName] = this;
    },

    getCliOptions: function() {
        return this.cli;
    },

    getCmd: function() {
        var cmd = [this.cmd];

        if (this.cmdIsBatch) {
            cmd.push('.bat');
        }

        if (this.cmdIsShell) {
            cmd.push('.sh');
        }

        return cmd.join('');
    },

    getCmdName: function() {
        return this.cmdName;
    },

    getDescription: function() {
        return this.description || '';
    },

    getName: function() {
        return this.name;
    },

    getOptionsText: function() {
        return '[OPTIONS...]';
    },

    getShortDescription: function() {
        return this.shortDescription || '';
    },

    getTabs: function(numTabs) {
        var buffer = '';
        for (var i = 0; i < numTabs; i++) {
            buffer += '\t';
        }
        return buffer;
    },

    isValid: function() {
        return this.cli.isValid();
    },

    printUsage: function() {
        var usage = [
                'usage: sencha ' + this.getCmdName() + ' ' + this.getOptionsText(),
                ''
            ],
            desc = this.getDescription().split('\n'),
            hasOptions = this.cli.hasOptions(),
            line;

        usage.push(
            ' COMMAND: ' + this.getName(),
            ''
        );

        if (desc.length) {
            usage.push(
                ' DESCRIPTION:',
                ''
            );
            desc.forEach(function(d) {
                line = '   ';
                d.split(' ').forEach(function(word) {
                    if (line.length + word.length >= 80) {
                        usage.push(line);
                        line = '   ';
                    }
                    line += word + ' ';
                });
                usage.push(line);
            });
        }

        if (hasOptions) {
            usage.push(
                ' OPTIONS:',
                ''
            );
        }

        usage.forEach(function(line) {
            writeln(line);
        });

        if (hasOptions) {
            this.cli.printUsage();
        }
    },

    run: function() {
        var cmd = [this.getCmd()],
            opts = this.cli.options,
            opt;

        for (var key in opts) {
            if (opts.hasOwnProperty(key)) {
                opt = opts[key];
                if (opt.toggled) {
                    cmd.push(' --', key, ' ', opt.getValue());
                }
            }
        }

        Cmd.execute(cmd.join(''));
    }
});

Modules = {};
Module.modules = {};
Module.printUsage = function() {
    var usage = [
            '\033[31m\033[1m[WARN] The current working directory ('+system.cwd+') is not a recognized ' +
            'Sencha SDK or application folder. Running in backwards compatible mode.\033[22m\033[39m',
            '',
            'Sencha Command v2.0.0 Beta 3',
            'Copyright (c) 2012 Sencha Inc.',
            '',
            'usage: sencha COMMAND [ARGS]',
            '',
            'The available commands are:'
        ],
        keys = [];

    for (var cmd in Module.modules) {
        if (Module.modules.hasOwnProperty(cmd)) {
            keys.push(cmd);
        }
    }

    keys.sort();
    for (var i = 0; i < keys.length; i++) {
        var mod = Module.modules[keys[i]],
            cmdName = mod.getCmdName(),
            numTabs = ((cmdName.length + 3) / 8) > 2 ? 2 : 3;
        usage.push(
            '   ' + cmdName + mod.getTabs(numTabs) + mod.getShortDescription()
        );
    }

    usage.push(
        '',
        'See \'sencha help COMMAND\' for more information on a specific command.'
    );

    usage.forEach(function(line) {
        writeln(line);
    });
};
