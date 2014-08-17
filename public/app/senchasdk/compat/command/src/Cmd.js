Cmd = {
    execute: function(cmd) {
        if (Platform.isWindows) {
            var stream = new Stream('exec://' + cmd);
            while (!stream.eof) {
                writeln(stream.readln());
            }
            stream.close();
        }
        else {
            system.execute(cmd);
        }
    }
};