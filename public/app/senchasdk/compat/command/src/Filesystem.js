Filesystem = {
    dirExists: function(path) {
        var cmd = Platform.isWindows ? 'cmd /C "dir ' + path + ' > NUL 2>&1"' : 'ls ' + path + ' > /dev/null 2>&1';
        var proc = new Process(cmd);
        while (proc.active) sleep(100);
        return proc.exitCode === 0;
    },

    exists : function(path) {
        return system.exists(path);
    },

    getFullPath: function(path) {
        var lastIndexOfSep = path.lastIndexOf(Fs.sep),
            relativePath, end, currentPath, absolutePath;

        if (lastIndexOfSep !== -1) {
            relativePath = path.substring(0, lastIndexOfSep),
            end = path.substr(lastIndexOfSep + 1);
        }
        else {
            relativePath = '.';
            end = path;
        }

        currentPath = system.setcwd(relativePath);
        absolutePath = system.setcwd(currentPath);

        return (absolutePath + Fs.sep + end).replace(/\/\.\/$/, '');
    },

    getPath: function(path){
        return path.replace(/\//g, Fs.sep);
    },

    mkdir: function(path) {
        if (Platform.isWindows) {
            system.mkdir(path);
        }
        else {
            Cmd.execute('mkdir -p ' + path);
        }
        return this.getFullPath(path);
    },

    readFile : function(file) {
        if (!Fs.exists(file)) {
            return '';
        }

        file = new Stream(file);
        var contents = file.readFile();
        file.close();

        // BOMs
        var boms = [
            /^\xEF\xBB\xBF/,                            // UTF-8
            /^\xFE\xFF/,                                // UTF-16 (BE)
            /^\xFF\xFE/,                                // UTF-16 (LE)
            /^\x00\x00\xFE\xFF/,                        // UTF-32 (BE)
            /^\xFF\xFE\x00\x00/,                        // UTF-32 (LE)
            /^\x2B\x2F\x76(\x38|\x39|\x2B|\x2F)/,       // UTF-7
            /^\xF7\x64\x4C/,                            // UTF-1
            /^\xDD\x73\x66\x73/,                        // UTF-EBCDIC
            /^\x0E\xFE\xFF/,                            // SCSU
            /^\xFB\xEE\x28\xFF?/,                       // BOCU-1
            /^\x84\x31\x95\x33/                         // GB-18030
        ];

        for (var i = 0; i < boms.length; i++) {
            var bom = boms[i];
            if (bom.test(contents)) {
                contents = contents.replace(bom, '');
                break;
            }
        }

        return contents;
    },

    writeFile: function(file, contents) {
        file = new Stream(file, 'w');
        file.writeln(contents);
        file.close();

        return contents;
    },

    copy: function(src, dest) {
        src = Fs.getPath(src);
        dest = Fs.getPath(dest);

        if (Platform.isWindows) {
            if (Fs.endsWith(src, Fs.sep)) {
                src = src.slice(0, -1); // cut off any trailing \
            }

            /**
             * Check if we're copying a single file. This isn't bulletproof, however xcopy
             * will prompt regarding if the item is a directory or file, with no way to
             * suppress the prompt. As such, this will catch a majority of scenarios
             * and actually make the build work!
             */
            var isFile = /\.[0-9a-z]{2,4}$/i;
            if (isFile.test(src)) {
                system.copy(src, dest);
            } else {
                Cmd.execute('xcopy ' + src + ' ' + dest + ' /E /Y /I');
            }
        }
        else {
            try {
                // q: quiet
                // r: recursive
                // u: only update if newer
                // p: keep permissions
                // L: copy the contents of symlinks
                Cmd.execute('rsync -qrupL ' + src + ' ' + dest);
            }
            catch(e) {
                Cmd.execute('cp -Rpf ' + src + ' ' + dest);
            }
        }
    },

    endsWith: function(str, last){
        return str.lastIndexOf(last) == str.length - 1;
    },

    split: function(file) {
        var split = [];
        if (!Fs.exists(file)) {
            return split;
        }
        file = new Stream(file);
        while (!file.eof) {
            split.push(file.readln().trim());
        }
        return split;
    },

    remove: function(file) {
        if (Platform.isWindows) {
            var success = system.remove(file);
            if (!success) {
                Cmd.execute('cmd /C del /f /q /s "' + file + '"');
            }
        } else {
            Cmd.execute('rm -Rf "' + file + '"');
        }
    }
};

// Create short alias
Fs = Filesystem;

Fs.sep = (Fs.getFullPath('.')[0] == '/') ? '/': '\\';
Fs.fileWorkingDir = Fs.getFullPath('.');
