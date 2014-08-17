var escapeRegexRe = /([-.*+?^${}()|[\]\/\\])/g;

function escapeRegex(string) {
    return string.replace(escapeRegexRe, "\\$1");
}

var sourceDirectories = system.args[1],
    excludes = system.args[2] ? system.args[2].split(',') : [],
    excludeRegex = new RegExp(excludes.map(escapeRegex).join('|')),
    output = system.args[3];

// Traverses the specified path and collects all *.js files.
// Note: the traversal is recursive to all subdirectories.
function scanDirectory(path) {
    var entries = [],
        subdirs;

    if (fs.exists(path) && fs.isFile(path) && path.match('.js$')) {
        entries.push(path);
    } else if (fs.isDirectory(path)) {
        fs.list(path).forEach(function(e) {
            subdirs = scanDirectory(path + '/' + e);
            subdirs.forEach(function(s) {
                entries.push(s);
            });
        });
    }

    return entries;
}

var scanDirectories = function(paths) {
    var sources = [],
        excludes = [];

    paths.split(',').forEach(function(path) {
        scanDirectory(path).forEach(function(source) {
            sources.push(source);
        });
    });

    return sources;
};

var timestamp = Date.now(),
    manifest = [],
    sources = scanDirectories(system.args[1]);

if (excludes.length > 0) {
    sources = sources.filter(function(item) {
        return item.search(excludeRegex) === -1;
    });
}

sources.forEach(function(fileName) {
    // Loads the content of a file and returns the syntax tree.
    function parse(path) {
        var file = fs.open(path, 'r'),
            content = '',
            line;

        while (true) {
            line = file.readLine();
            if (line.length === 0) {
                break;
            }
            content += line;
        }
        file.close();
        return Reflect.parse(content);
    }

    // Recursively visits v and all child objects of v and executes
    // functions f for each visit.
    function visit(v, f) {
        var child;

        f(v);

        for (var i in v) {
            child = v[i];
            if (child !== null && typeof child === 'object') {
                visit(child, f);
            }
        }
    }

    // Matches the subtree 'code' with Ext.extend(Ext.foo, Ext.bar, ...)
    // or Ext.foo = Ext.extend(Ext.bar, ...).
    // Returns the metaclass if successful, otherwise returns undefined.
    var matchExtend = function(code) {
        var meta = {},
            properties;

        if ((code.type === 'ExpressionStatement') &&
                (typeof code.expression !== 'undefined') &&
                (code.expression.type === 'CallExpression') &&
                (typeof code.expression.callee !== 'undefined') &&
                (code.expression.callee.type === 'MemberExpression') &&
                (code.expression.arguments.length === 3) &&
                (code.expression.callee.object.type === 'Identifier') &&
                (code.expression.callee.object.name === 'Ext') &&
                (code.expression.callee.property.type === 'Identifier') &&
                (code.expression.callee.property.name === 'extend')) {

            meta.className = '';
            meta.extend = '';

            visit(code.expression.arguments[0], function(v) {
                if (v.type === 'Identifier') {
                    if (meta.className.length > 0)
                        meta.className += '.';
                    meta.className += v.name;
                }
            });

            visit(code.expression.arguments[1], function(v) {
                if (v.type === 'Identifier') {
                    if (meta.extend.length > 0)
                        meta.extend += '.';
                    meta.extend += v.name;
                }
            });

            properties = code.expression.arguments[2].properties;

            if (properties && properties.length > 0) {
                properties.forEach(function(e) {
                    if ((e.value.type === 'FunctionExpression')) {
                        if (!meta.functions) {
                            meta.functions = [];
                        }
                        meta.functions.push(e.key.name);
                    }
                });
            }

            if (meta.functions) {
                meta.functions.sort();
            }

            if (meta && meta.className.substr(0, 4) !== 'Ext.') {
                meta = undefined;
            }

            return meta;
        }

        if ((code.type === 'AssignmentExpression') &&
                (code.right.type === 'CallExpression') &&
                (code.right.callee.type == 'MemberExpression') &&
                (code.right.callee.object.type == 'Identifier') &&
                (code.right.callee.object.name == 'Ext') &&
                (code.right.callee.property.type == 'Identifier') &&
                (code.right.callee.property.name == 'extend')) {

            meta.className = '';
            meta.extend = '';

            visit(code.left, function(v) {
                if (v.name) {
                    if (meta.className.length > 0)
                        meta.className += '.';
                    meta.className += v.name;
                }
            });

            visit(code.right.arguments[0], function(v) {
                if (v.name) {
                    if (meta.extend.length > 0)
                        meta.extend += '.';
                    meta.extend += v.name;
                }
            });

            properties = code.right.arguments[1].properties;

            if (properties && properties.length > 0) {
                properties.forEach(function(e) {
                    if ((e.value.type === 'FunctionExpression')) {
                        if (!meta.functions) {
                            meta.functions = [];
                        }
                        meta.functions.push(e.key.name);
                    }
                });
            }

            if (meta.functions) {
                meta.functions.sort();
            }

            if (meta && meta.className.substr(0, 4) !== 'Ext.') {
                meta = undefined;
            }

            return meta;
        }

        return undefined;
    };

    // Matches the subtree 'code' with Ext.define('SomeClassName', ...).
    // Returns the metaclass if successful, otherwise returns undefined.
    var matchDefine = function(code) {
        var meta = {},
            properties;

        if ((code.type === 'CallExpression') &&
                (typeof code.callee !== 'undefined') &&
                (code.callee.type === 'MemberExpression') &&
                (code.callee.object.type === 'Identifier') &&
                (code.callee.object.name === 'Ext') &&
                (code.callee.property.type === 'Identifier') &&
                (code.callee.property.name === 'define') &&
                (code.arguments.length >= 2) &&
                (code.arguments.length <= 3) &&
                (code.arguments[0].type === 'Literal')) {

            meta.className = code.arguments[0].value;
            properties = code.arguments[1].properties;

            if (properties && properties.length > 0) {
                properties.forEach(function(e) {
                    if ((e.type === 'Property') &&
                            (e.key !== undefined) &&
                            (e.value !== undefined) &&
                            (e.key.type === 'Identifier')) {

                        if ((e.key.name === 'extend') &&
                                (e.value.type === 'Literal')) {
                            meta.extend = e.value.value;
                        }

                        if ((e.key.name === 'alias') &&
                                (e.value.type === 'Literal')) {
                            meta.alias = e.value.value;
                        }

                        if ((e.key.name === 'alias') &&
                                (e.value !== undefined) &&
                                (e.value.elements !== undefined) &&
                                (e.value.elements.length > 0) &&
                                (e.value.type === 'ArrayExpression')) {
                            meta.alias = [];
                            e.value.elements.forEach(function(g) {
                                if (g.type === 'Literal') {
                                    meta.alias.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'xtype') &&
                                (e.value.type === 'Literal')) {
                            meta.xtype = e.value.value;
                        }

                        if ((e.key.name === 'xtype') &&
                                (e.value !== undefined) &&
                                (e.value.elements !== undefined) &&
                                (e.value.elements.length > 0) &&
                                (e.value.type === 'ArrayExpression')) {
                            meta.xtype = [];
                            e.value.elements.forEach(function(g) {
                                if (g.type === 'Literal') {
                                    meta.xtype.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'singleton') &&
                                (e.value.type === 'Literal')) {
                            meta.singleton = e.value.value;
                        }

                        if ((e.key.name === 'alternateClassName') &&
                                (e.value.type === 'Literal')) {
                            meta.alternateClassName = e.value.value;
                        }

                        if ((e.key.name === 'alternateClassName') &&
                                (e.value !== undefined) &&
                                (e.value.elements !== undefined) &&
                                (e.value.elements.length > 0) &&
                                (e.value.type === 'ArrayExpression')) {
                            meta.alternateClassName = [];
                            e.value.elements.forEach(function(g) {
                                if (g.type === 'Literal') {
                                    meta.alternateClassName.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'requires') &&
                                (e.value.value !== undefined) &&
                                (e.value.type === 'Literal')) {
                            meta.requires = [ e.value.value ];
                        }

                        if ((e.key.name === 'requires') &&
                                (e.value !== undefined) &&
                                (e.value.elements !== undefined) &&
                                (e.value.elements.length > 0) &&
                                (e.value.type === 'ArrayExpression')) {
                            meta.requires = [];
                            e.value.elements.forEach(function(g) {
                                if (g.type === 'Literal') {
                                    meta.requires.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'uses') &&
                                (e.value !== undefined) &&
                                (e.value.elements !== undefined) &&
                                (e.value.elements.length > 0) &&
                                (e.value.type === 'ArrayExpression')) {
                            meta.uses = [];
                            e.value.elements.forEach(function(g) {
                                if (g.type === 'Literal') {
                                    meta.uses.push(g.value);
                                }
                            });
                        }

                        if ((e.key.name === 'mixins') &&
                                (e.value !== undefined) &&
                                (e.value.properties !== undefined) &&
                                (e.value.properties.length > 0) &&
                                (e.value.type === 'ObjectExpression')) {
                            meta.mixins = {};
                            e.value.properties.forEach(function(m) {
                                if ((m.type && m.type === 'Property') &&
                                        (m.key && m.key.type && m.key.type === 'Identifier') &&
                                        (m.value && m.value.type && m.value.type === 'Literal')) {
                                    meta.mixins[m.key.name] = m.value.value;
                                }
                            });
                        }

                        if ((e.value.type === 'FunctionExpression')) {
                            if (!meta.functions) {
                                meta.functions = [];
                            }
                            meta.functions.push(e.key.name);
                        }

                    }
                });
            }
        }

        if (meta.functions) {
            meta.functions.sort();
        }

        return meta;
    };

    var tree = parse(fileName);

    if (typeof tree === 'undefined') {
//        system.print('Warning:', fileName, 'is not a valid JavaScript source');
        return;
    }

    visit(tree, function(expr) {
        var meta = {};
        meta = matchExtend(expr);

        if (!meta) {
            meta = matchDefine(expr);
        }

        if (meta && meta.className) {
            meta.source = fileName;
            manifest.push(meta);
        }
    });

});

try {
    manifest = JSON.stringify(manifest);

} catch(e) {
    system.print(e.toString());
    system.exit(1);
}


if (output) {
    var out = fs.open(output, 'w');
    out.writeLine(manifest);
    out.close();

    system.print('Manifest is written to: ' + output + '.');
    system.print('Finished in ' + (Date.now() - timestamp) / 1000 + ' seconds.');
}
else {
    system.print(manifest);
}

system.exit();
