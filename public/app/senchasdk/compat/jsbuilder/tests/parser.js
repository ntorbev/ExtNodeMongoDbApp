Loader.require('Parser');
Loader.require('Filesystem');

Logger.DEBUG = true;

Parser.setParams({
    browser: 'ie',
    browserVersion: 6,
    version: 3.1,
    minVersion: 2.0,
    debug: true
});

assertTrue("Browser is IE", Parser.evaluate('browser', 'ie'));
assertTrue("Browser is not firefox", Parser.evaluate('browser', '!firefox'));
assertTrue("Browser version is greater than 5", Parser.evaluate('browserVersion', '>5'));
assertTrue("Browser version is less than 7", Parser.evaluate('browserVersion', '<7'));
assertTrue("Browser version is greater or equal to 6", Parser.evaluate('browserVersion', '>=6'));
assertFalse("Nonexistent", Parser.evaluate('nonexistent'));

assertTrue("//<if browser=ie> is a valid statement", Parser.isStatement('//<if browser=ie>'));
assertTrue("    //<if browser=ie> (tab in front) is a valid statement", Parser.isStatement('    //<if browser=ie>'));
assertTrue("//<if browser=ie> (spaces at the end) is a valid statement", Parser.isStatement('//<if browser=ie>      '));

assertFalse("//</if> is not a valid opening statement", Parser.isStatement('//</if>'));
assertTrue("//</if> is valid close of if", Parser.isCloseOf('//</if>', { type: 'if', isInverted: false }));
assertTrue("//</!if> is valid close of inverted if", Parser.isCloseOf('//</!if>', { type: 'if', isInverted: true }));

assertEqual("Parser.parseStatementProperties('browser=ie debug')",
    Parser.parseStatementProperties('browser=ie debug'), { browser: 'ie', debug: true });

assertEqual("Parser.parseStatementProperties('browser=\"ie\" browserVersion='!7' debug=false')",
    Parser.parseStatementProperties('browser="ie" browserVersion=\'!7\' debug=false'), { browser: 'ie', browserVersion: '!7', debug: "false" });

assertEqual("Parser.parseStatement('//<deprecated since=\"3.0\">')",
    Parser.parseStatement('//<deprecated since="3.0">'), { properties: { since: '3.0' }, type: 'deprecated', isInverted: false });

assertEqual("Parser.parse before1.js and after1.js",
    Parser.parse(PATH + 'tests/parser/before1.js'), Filesystem.readFile(PATH + 'tests/parser/after1.js'));

assertEqual("Parser.parse before2.js and after2.js",
    Parser.parse(PATH + 'tests/parser/before2.js'), Filesystem.readFile(PATH + 'tests/parser/after2.js'));

Parser.setParams({
    debug: true,
    debugLevel: 2,
    foo: 'no'
});

assertEqual("Parser.parse before3.js and after3.js",
    Parser.parse(PATH + 'tests/parser/before3.js'), Filesystem.readFile(PATH + 'tests/parser/after3.js'));

assertEqual("Parser.parse before4.js and after4.js",
    Parser.parse(PATH + 'tests/parser/before4.js'), Filesystem.readFile(PATH + 'tests/parser/after4.js'));

assertEqual("Parser.parse before5.js and after5.js",
    Parser.parse(PATH + 'tests/parser/before5.js'), Filesystem.readFile(PATH + 'tests/parser/after5.js'));

assertEqual("Parser.parse before6.js and after6.js",
    Parser.parse(PATH + 'tests/parser/before6.js'), Filesystem.readFile(PATH + 'tests/parser/after6.js'));

////////////////////////////////////////////////////////////////////////////////
// deprecated-product
(function(){

    Parser.setParams({
        product: 'foo',
        minVersion: 1.0
    });
    assertEqual("<deprecated product> must not be removed when 'minVersion' is less than 'since'",
        Parser.parse(PATH + 'tests/parser/deprecated-product.mock.js'),
        'innards\n'
    );

    Parser.setParams({
        product: 'foo',
        minVersion: 10.0
    });
    assertEqual("<deprecated product> must be removed when 'minVersion' is higher than 'since'",
        Parser.parse(PATH + 'tests/parser/deprecated-product.mock.js'),
        ''
    );
    
    Parser.setParams({
        product: 'bar',
        minVersion: 1.0
    });
    assertEqual("<deprecated product> must not be removed when product is different",
        Parser.parse(PATH + 'tests/parser/deprecated-product.mock.js'),
        'innards\n'
    );
    
    Parser.setParams({
        product: 'bar',
        minVersion: 10.0
    });
    assertEqual("<deprecated product> must not be removed when product is different, even if the minVersion is higher",
        Parser.parse(PATH + 'tests/parser/deprecated-product.mock.js'),
        'innards\n'
    );
    
    Parser.setParams({
        product: undefined,
        minVersion: 1.0
    });
    assertEqual("<deprecated> without product must NOT be removed, even when minVersion < since",
        Parser.parse(PATH + 'tests/parser/deprecated-product.mock.js'),
        'innards\n'
    );
    
    Parser.setParams({
        product: undefined,
        minVersion: 10.0
    });
    assertEqual("<deprecated> without product must NOT be removed, even when minVersion > since",
        Parser.parse(PATH + 'tests/parser/deprecated-product.mock.js'),
        'innards\n'
    );

}())




