Ext.define('NickApp.model.FinishedTask', {
    extend: 'Ext.data.Model',
//    proxy: {
//        type: 'rest',
//        url : '/users',
//        reader: {
//            type: 'json',
//            root: 'User'
//        }
//    },
    fields: [{
        name: 'time',
        type: 'date'
    },{
        name: 'comments'
    }]
});
