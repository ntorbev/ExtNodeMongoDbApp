var PATH = system.script.replace(/tests(\/|\\)run.js/, '');
load(PATH + 'src/Loader.js');

Loader.setBasePath(PATH + 'src');

Loader.require([
    'Ext',
    'Cli',
    'Logger'
]);

var assertTrue = function(message, a) {
    assertEqual(message, a, true);
};
var assertFalse = function(message, a) {
    assertEqual(message, a, false);
};
var assertEqual = function(message, a, b) {
    if ((Ext.isArray(a) || Ext.isObject(a)) && (Ext.isArray(b) || Ext.isObject(b))) {
        a = JSON.stringify(a);
        b = JSON.stringify(b);
    }
    var equal = (a === b);
    Logger.log("[" + (equal ? "PASSED" : "FAILED") + "] " + message);
    if (!equal) {
        Logger.log("      actual: '" + a + "'");
        Logger.log("    expected: '" + b + "'");
    }
};
var assertNotEqual = function(message, a, b) {
    assertEqual(message, a, !b);
};

var Tester = Ext.extend(Cli, {
    name: "Super simple Unit Tester",
    version: "1.0",

    map: {
        n: {
            name: 'name',
            required: true,
            desc: 'Name of the test you want to run, e.g Parser'
        }
    },

    run: function() {
        if (Tester.superclass.run.call(this) === false)
            return;

        load(PATH + 'tests/'+this.get('name')+'.js');
    }
});

var tester = new Tester();
tester.run();
