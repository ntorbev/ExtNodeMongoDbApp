Ext.define('NickApp.controller.Users', {
    extend: 'Ext.app.Controller',
    views:[
        'users.List',
        'users.Add'
    ],
    stores:[
        'Users',
        'FinishedTask'
    ],
    refs: [
        {
            ref: 'UsersList',
            selector: 'usersList'
        },
        {
            ref: 'UsersAdd',
            selector: 'usersAdd'
        }
    ],
    init: function () {
        var me = this;

        this.control({
            'usersList > toolbar > button#add': {
                click: me.onUsersAddClick
            },
            'usersList':{
                removeRow: me.removeRow,
                beforerender:me.beforeRend
            },
            'usersAdd > form button#save': {
                click: me.onUsersAddSaveClick
            },
            'usersAdd > form button#cancel': {
                click: me.onUsersAddCancelClick
            }
        });
    },
    removeRow: function(grid, rowIndex, colIndex){
        //ask user about removing
        Ext.Msg.confirm('Confirm', 'Remove?', function(button) {
            if (button === 'yes') {
                grid.getStore().remove(grid.getSelectionModel().getSelection()[0]);
//                grid.getStore().removeAt(grid.getSelectionModel().selected.items[0].index);
            }
        });
    },
    beforeRend:function(){
        Ext.Ajax.request({
            url : '/users',
            success: function(res, opts) {
                var response = Ext.decode(res.responseText),
                    users = Ext.StoreManager.get('Users'),
                    finishedtaks = Ext.StoreManager.get('FinishedTask');
                users.loadData(response.User);
                finishedtaks.loadData(response.User);
            },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    },
    onUsersAddCancelClick: function(button, e, eOpts) {
        this.getUsersAdd().destroy();
    },
    onUsersAddSaveClick: function(){
        var me = this,
            form = me.getUsersAdd().down('form').getForm(),
            rec;

            form.updateRecord();
            rec = form.getRecord();
            Ext.Ajax.request({
                url : '/users',
                method:'POST',
                headers: { "Content-Type": "application/json" },
                params:JSON.stringify(rec.data),
                success: function(res, opts) {
                    var response = Ext.decode(res.responseText),
                        usersInfo = Ext.StoreManager.get('Users'),
                        finishedTask = Ext.StoreManager.get('FinishedTask');
                    usersInfo.add(rec);
//                    var a=me.getUsersList()
//                    finishedTask.loadData(response.User);
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
//            me.getUsersList().getStore().add(rec);
            me.getUsersAdd().destroy();
        }
    },
    onUsersAddClick: function(){
        var me = this,
            window = Ext.widget('usersAdd');

        window.show();
        window.down('form').getForm().loadRecord(new NickApp.model.User());
    }
});