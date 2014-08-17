Logger = {
  /**
    * Logs the variable to the command line
    */
    log: function(variable) {
        variable = String(variable);
        if (variable.indexOf('[DEBUG]') == 0 && !Logger.DEBUG) return;
        variable = variable.replace(/^\[FAIL.*$/,'\x1b[31m$&\x1b[0m');
        variable = variable.replace(/^\[PASS.*$/,'\x1b[32m$&\x1b[0m');
        writeln(variable);
    }
};
