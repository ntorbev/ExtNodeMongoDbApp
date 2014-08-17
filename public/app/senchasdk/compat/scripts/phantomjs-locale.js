(function(){

    var fs = require('fs'),
        startRe = /^\/\/(?:\t|\s)*<\s*\s*locale[^>]*>$/,
        endRe = /^\/\/(?:\t|\s)*<\s*\/\s*locale\s*>$/,
        infoRe = /^\/\/(?:\t|\s)*<\s*\s*localeInfo[^>]*\/\s*>$/,
        spaceRe = /\s+/g,
        propRe = /(\w+)="(\w+)"/,
        commaRe = /,$/;

function parseArguments() {
    var args = { targets: [] },
        key = null,
        i, ln, arg, match;

    for (i = 0, ln = phantom.args.length; i < ln; i++) {
        arg = phantom.args[i];

        if (key !== null) {
            if (!arg.match(/^-{1,2}([^-])/i)) {
                args[key] = arg;
                key = null;
                continue;
            }

            args[key] = true;
            key = null;
        }

        if ((match = arg.match(/^--(.+)$/i)) || (match = arg.match(/^-(.+)$/i))) {
            key = match[1];
        }
        else if (match = arg.match(/^--([^=]+)=(.*)$/i)) {
            args[match[1]] = match[2];
        }
        else if (match = arg.match(/^-([\w]+)$/i)) {
            match[1].split('').forEach(function(a) {
                args[a] = true;
            });
        }
        else {
            args.targets.push(arg);
        }
    }

    if (key !== null) {
        args[key] = true;
    }

    return args;
};

function getFileList(projectFile) {
    var files = [],
        o;

    if (fs.exists(projectFile)) {
        try {
            content = fs.read(projectFile);
            o = JSON.parse(content);
            if (o.builds) {
                o.builds.forEach(function(build){
                    build.files.forEach(function(file){
                        if (file.clsName) {
                            files.push(file);
                        }
                    });
                });
            }
        } catch (e) {
            throw new Error("Failed parsing JSB file: " + projectFile + ". Please make sure its content is of valid JSON format");
            phantom.exit();
        }
    } else {
        throw new Error('File does not exist: "' + projectFile + '"');
        phantom.exit();
    }
    return files;
}

function getProjectRoot(projectFile) {
    projectFile = projectFile.replace(/\\/g, '/');
    var parts = projectFile.split('/');
    // Empty this out so we still get a trailing '/'
    parts[parts.length - 1] = '';
    return parts.join('/');
}

function isLocaleInfo(str) {
    return str.trim().match(infoRe);
}

function isStartTag(str) {
    return str.trim().match(startRe);
}

function isEndTag(str) {
    return str.trim().match(endRe);
}

function extractMetaInfo(str) {
    str = str.replace(spaceRe, ' ').replace('>', '');
    var parts = str.split(' '),
        out = {},
        match;

    // ignore first part
    parts.shift();
    parts.forEach(function(part){
        match = part.match(propRe);
        if (match) {
            out[match[1]] = match[2];
        }
    });
    if (!out.type) {
        out.type = 'property';
    }
    if (!out.property) {
        out.property = null;
    }
    return out;
}

function extractLocaleContent(file, projectRoot) {
    var lines = fs.read(projectRoot + file.path + file.name).split('\n'),
        chunks = [],
        buffer = [],
        meta = null,
        fileInfo = {},
        inTag;

    lines.forEach(function(line){
        if (isLocaleInfo(line)) {
            fileInfo = extractMetaInfo(line);
        } else if (isStartTag(line)) {
            inTag = true;
            meta = extractMetaInfo(line);
        } else if (isEndTag(line)) {
            inTag = false;
            chunks.push({
                lines: buffer,
                type: meta.type,
                property: meta.property
            });
            meta = null;
            buffer = [];
        } else if (inTag) {
            buffer.push(line.trim());
        }
    });
    return {
        chunks: chunks,
        useApply: !!fileInfo.useApply
    };
}

function trimEndComma(line) {
    if (line.charAt(line.length - 1) == ',') {
       return line.replace(commaRe, '');
    }
    return line;
}

function printChunk(chunk, isLast) {
    switch (chunk.type) {
        case 'array':
            printArray(chunk, isLast);
            break;
        case 'object':
            printObject(chunk, isLast);
            break;
        case 'function':
            printFunction(chunk, isLast);
            break;
        default:
            printProperty(chunk, isLast);
    }
}

function printMultiLine(chunk, isLast) {
    var lines = chunk.lines,
        lastIndex = lines.length - 1,
        currIndent;

    lines.forEach(function(line, index) {
        currIndent = indent + indent;
        if (!(index == 0 || index == lastIndex)) {
            currIndent += indent;
        }
        if (isLast && index == lastIndex) {
            line = trimEndComma(line);
        }
        buffer.push(currIndent + line);
    });
}

function printFunction(chunk, isLast) {
    // separated out, we may need other features in future
    printMultiLine(chunk, isLast);
}

function printArray(chunk, isLast) {
    // separated out, we may need other features in future
    printMultiLine(chunk, isLast);
}

function printObject(chunk, isLast) {
    // separated out, we may need other features in future
    printMultiLine(chunk, isLast);
}

function printProperty(chunk, isLast) {
    var lines = chunk.lines,
        lastIndex = lines.length - 1;

    lines.forEach(function(line, index){
        if (isLast && index == lastIndex) {
            line = trimEndComma(line);
        }
        buffer.push(indent + indent + line);
    });
}


var args = parseArguments(),
    projectFile = args.projectFile,
    files = getFileList(projectFile),
    projectRoot = getProjectRoot(projectFile),
    buffer = ['(function() {', '', 'var CM = Ext.ClassManager;'],
    indent = '    ';

files.forEach(function(file){
    var fileInfo = extractLocaleContent(file, projectRoot),
        chunks = fileInfo.chunks,
        atEnd = [],
        lastIndex;

    if (chunks.length) {
        buffer.push('CM.onCreated(function() {');
        if (fileInfo.useApply) {
            buffer.push(indent + 'Ext.apply(' + file.clsName + ', {')
        } else {
            buffer.push(indent + file.clsName + '.override({')
        }
        lastIndex = chunks.length - 1;
        chunks.forEach(function(chunk, index){
            if (chunk.property) {
                atEnd.push(chunk);
            } else {
                printChunk(chunk, index == lastIndex);
            }
        });
        buffer.push(indent + '});');
        if (atEnd.length) {
            lastIndex = atEnd.length - 1;
            atEnd.forEach(function(chunk, index){
                buffer.push(indent + 'Ext.apply(' + file.clsName + '.' + chunk.property + ', {')
                printChunk(chunk, index == lastIndex);
                buffer.push(indent + '});');
            });
        }
        buffer.push('}, null, \'' + file.clsName + '\');');
        buffer.push('');
    }
});
buffer.push('})();');

fs.write(args.target, buffer.join('\n'), 'w');

phantom.exit();


})();
