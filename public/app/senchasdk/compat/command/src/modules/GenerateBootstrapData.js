Modules.GenerateBootstrapData = Ext.extend(Module, {
    name: 'Generate Bootstrap Data',
    cmdName: 'create bootstrapdata',
    description: 'Generate boostrap data',
    shortDescription: 'generate boostrap data',

    constructor: function() {
        Modules.GenerateBootstrapData.superclass.constructor.call(this);

        this.cli.add({
            name: 'jsb',
            alias: 'j',
            description: 'The path to the framework\'s jsb3 file',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'core',
            alias: 'c',
            description: 'The list of all core package names, comma-separated, for example: "foundation,core,dom"',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'platform',
            alias: 'p',
            description: 'The path to platform source directory',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'src',
            alias: 's',
            description: 'The path to the framework\'s source directory',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'ignore',
            alias: 'i',
            description: 'The list of items to be ignored, comma-separated',
            attrs: CliOptionAttr.ValueOptional
        }).add({
            name: 'output',
            alias: 'o',
            description: 'The file path to write bootstrap data to',
            attrs: CliOptionAttr.Required
        }).add({
            name: 'output-release',
            alias: 'r',
            description: 'The file path to write bootstrap data-release to',
            attrs: CliOptionAttr.ValueOptional
        });
    },

    pathToNamespace: function(path) {
        var escapedSep = this.escapeRegex(Fs.sep);

        return path.replace(new RegExp('^' + escapedSep), '')
                   .replace(new RegExp(escapedSep, 'g'), '.')
                   .replace(/\.js$/, '');
    },

    escapeRegexRe: /([-.*+?^${}()|[\]\/\\])/g,

    escapeRegex: function(string) {
        return string.replace(this.escapeRegexRe, "\\$1");
    },

    run: function() {
        var options = this.cli.options,
            jsbPath = options.jsb.getValue(),
            srcPath = Fs.getFullPath(options.src.getValue()),
            platformPath = Fs.getFullPath(options.platform.getValue()),
            outputPath = Fs.getFullPath(options.output.getValue()),
            ignore = options.ignore.getValue(),
            corePackageNames = options.core.getValue().split(','),
            jsb = JSON.parse(Fs.readFile(jsbPath)),
            coreFiles = [],
            platformOnlyFolders = [],
            platformOnlyFiles = [],
            excludes = [],
            allClasses = [],
            createManifestCmd = "sencha create manifest -s " + srcPath + "," + platformPath + " -i " + excludes.join(","),
            excludeRegex, stream, manifest;

        if (ignore) {
            excludes = ignore.split(',');
            excludeRegex = new RegExp(excludes.map(this.escapeRegex).join('|'));
        }

        function filterIgnored(item) {
            if (!excludeRegex) {
                return true;
            }

            return item.search(excludeRegex) === -1;
        }

        function getPlatformOnlyFolders(path) {
            system.setcwd(platformPath + Fs.sep + path);

            var folders = system.folders(),
                currentPath, absoluteCurrentPath;

            folders.forEach(function(folder) {
                currentPath = (path) ? (path + Fs.sep + folder) : folder;
                absoluteCurrentPath = platformPath + Fs.sep + currentPath;

                system.setcwd(srcPath + Fs.sep + path);

                if (system.folders().indexOf(folder) !== -1) {
                    getPlatformOnlyFolders(currentPath);
                }
                else if (absoluteCurrentPath.search(excludeRegex) === -1) {
                    platformOnlyFolders.push(currentPath);
                }
            });
        }

        function getPlatformOnlyFiles(path) {
            system.setcwd(platformPath + Fs.sep + path);

            var platformFiles = system.files('*.js'),
                platformFolders = system.folders(),
                currentPath, filePath, absoluteFilePath;

            system.setcwd(srcPath + Fs.sep + path);

            var files = system.files('*.js');

            platformFiles.forEach(function(file) {
                if (files.indexOf(file) === -1) {
                    filePath = (path ? (path + Fs.sep) : '') + file;
                    absoluteFilePath = platformPath + Fs.sep + filePath;

                    if (absoluteFilePath.search(excludeRegex) === -1) {
                        platformOnlyFiles.push(filePath);
                    }
                }
            });

            platformFolders.forEach(function(folder) {
                currentPath = (path) ? (path + Fs.sep + folder) : folder;

                if (platformOnlyFolders.indexOf(currentPath) === -1) {
                    getPlatformOnlyFiles(currentPath);
                }
            });
        }

        function getAllClasses(root, path) {
            system.setcwd(root + Fs.sep + path);

            var files = system.files('*.js'),
                folders = system.folders(),
                filePath, absoluteFilePath,
                currentPath;

            files.forEach(function(file) {
                if (path) {
                    filePath = path + Fs.sep + file;
                }
                else {
                    filePath = file;
                }

                absoluteFilePath = root + Fs.sep + filePath;

                if (absoluteFilePath.search(excludeRegex) === -1) {
                    allClasses.push('Ext.' + this.pathToNamespace(filePath));
                }
            }, this);


            folders.forEach(function(folder) {
                currentPath = (path) ? (path + Fs.sep + folder) : folder;

                getAllClasses.call(this, root, currentPath);
            }, this);
        }

        jsb.packages.forEach(function(pkg) {
            if (corePackageNames.indexOf(pkg.id) !== -1) {
                pkg.files.forEach(function(file) {
                    coreFiles.push((file.path + file.name));
                });
            }
        });

        getPlatformOnlyFolders('');
        getPlatformOnlyFiles('');

        platformOnlyFolders = platformOnlyFolders.map(this.pathToNamespace, this);

        platformOnlyFiles = platformOnlyFiles.map(this.pathToNamespace, this);

        stream = new Stream('exec://' + createManifestCmd),
        manifest = '';

        while (!stream.eof) {
            manifest += stream.readln();
        }

        stream.close();

        try {
            manifest = JSON.parse(manifest);
        } catch(e) {
            writeln('[ERROR] Manifest parsing failed.');
            system.exit();
            return;	
       }

        getAllClasses.call(this, platformPath, '');
        getAllClasses.call(this, srcPath, '');

        var classManifestMap = {};

        manifest.forEach(function(info) {
            classManifestMap[info.className] = info;
        });

        var nameToAliasesMap = {},
            alternateToNameMap = {},
            aliases, alternateClassNames, info, xtype, alias, alternateClassName;

        allClasses.forEach(function(className) {
            aliases = [];
            alternateClassNames = [];
            info = classManifestMap[className];

            if (info) {
                if (info.xtype) {
                    xtype = Ext.isArray(info.xtype) ? info.xtype : [info.xtype];
                    aliases = aliases.concat(xtype.map(function(value) {
                        return 'widget.' + value;
                    }));
                }

                if (info.alias) {
                    alias = Ext.isArray(info.alias) ? info.alias : [info.alias];
                    aliases = aliases.concat(alias);
                }

                if (info.alternateClassName) {
                    alternateClassName = Ext.isArray(info.alternateClassName) ? info.alternateClassName : [info.alternateClassName];
                    alternateClassNames = alternateClassNames.concat(alternateClassName);
                }

                nameToAliasesMap[className] = aliases;

                alternateClassNames.forEach(function(name) {
                    alternateToNameMap[name] = className;
                });
            }
        });

        Fs.writeFile(outputPath, 'this.ExtBootstrap.data = ' + JSON.stringify({
            coreFiles: coreFiles,
            platformFolders: platformOnlyFolders,
            platformFiles: platformOnlyFiles,
            nameToAliasesMap: nameToAliasesMap,
            alternateToNameMap: alternateToNameMap
        }, null, 4) + ';');

        var outputReleasePath = options['output-release'].getValue();

        if (outputReleasePath) {
            outputReleasePath = Fs.getFullPath(outputReleasePath);

            Fs.writeFile(outputReleasePath, 'this.ExtBootstrapData = ' + JSON.stringify({
                nameToAliasesMap: nameToAliasesMap,
                alternateToNameMap: alternateToNameMap
            }, null, 4) + ';');
        }
    }
});

new Modules.GenerateBootstrapData();
