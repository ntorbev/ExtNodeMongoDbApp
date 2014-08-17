Platform = {
    isUnix: Fs.sep == '/',
    isWindows: Fs.sep != '/'
};

if (!Platform.isWindows) {
    var proc = new Process('uname | grep Darwin > /dev/null');
    while (proc.active) sleep(20);
    Platform.isDarwin = proc.exitCode === 0;
}