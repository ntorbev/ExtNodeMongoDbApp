Ext.define('NickApp.store.FinishedTask', {
    extend: 'Ext.data.Store',
    model: 'NickApp.model.FinishedTask',
//    autoLoad: true,
    autoSync: true,
    remoteFilter: true
});