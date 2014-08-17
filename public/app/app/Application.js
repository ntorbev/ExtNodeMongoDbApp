Ext.Loader.setConfig({
    disableCaching: false
});
Ext.define('NickApp.Application', {
    name: 'NickApp',

    extend: 'Ext.app.Application',
    appFolder: 'app/app',
    requires: ['Ext.container.Viewport'],
//    autoCreateViewport: true,
    views:[
        'users.List',
        'users.Add'
    ],

    controllers: [
        'Users'
    ],

    stores: [
        'Users',
        'FinishedTask'
    ]
});
