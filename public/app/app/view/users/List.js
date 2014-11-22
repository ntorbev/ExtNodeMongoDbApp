Ext.define('NickApp.view.users.List', {
    extend: 'Ext.grid.Panel',
    xtype: 'usersList',
    title: 'Personal Info',
    viewConfig: {
        enableTextSelection: true,
        stripeRows: true
    },
    store: 'Users',
    initComponent: function () {
        var me = this,
            rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToEdit: 2
            }),
            rowMenu = Ext.create('Ext.menu.Menu', {
                height: 58,
                width: 140,
                items: [
                    {
                        text: 'Edit',
                        iconCls: 'button-edit',
                        scope:this,
                        handler: function(){
                            var index = me.store.indexOf(me.getSelectionModel().getSelection()[0]);
                            me.plugins[0].startEdit(index,0);
//                            me.fireEvent('editRow', this);
                        }
                    },
                    {
                        text: 'Remove',
                        iconCls: 'button-remove',
                        scope:this,
                        handler: function(){
                            me.fireEvent('removeRow', this);
                        }
                    }
                ]
            });
        this.listeners = {
            itemcontextmenu: function(view, record, item, index, e){
                e.stopEvent();
                rowMenu.showAt(e.getXY());
            },
            afterrender:function(){
                //
            }
        };
        this.plugins = [rowEditing];
        this.selType = 'rowmodel';
        this.dockedItems = [
            {
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    {
                        xtype: 'button',
                        style: 'border:1px solid #BDBDE4',
                        itemId: 'add',
                        text: 'Add user'
                    },
                    {
                        xtype: 'container',
                        flex: 1
                    }
                ]
            },
            {
                xtype: 'pagingtoolbar',
                dock: 'bottom',
                width: 360,
                displayInfo: true,
                store: 'Users'
            }
        ];
        this.columns = [
            {xtype: 'rownumberer'},
            { text: 'Id', dataIndex: '_id', hidden: true },
            {
                text: 'Login',
                dataIndex: 'login',
                editor: {
                    allowBlank: false
                }
            },
            {
                text: 'Email',
                dataIndex: 'email',
                flex: .5,
                editor: {
                    allowBlank: false
                }
            },
            {
                text: 'First Name',
                dataIndex: 'firstName',
                flex: .5,
                editor: {
                    allowBlank: false
                }
            },
            {
                text: 'Surname',
                dataIndex: 'lastName',
                flex: .5,
                editor: {
                    allowBlank: false
                }
            },
            {
                xtype: 'actioncolumn',
                width: 50,
                items: [
                    {
                        iconCls: 'button-edit',
                        tooltip: 'Edit',
                        handler: function (grid, rowIndex, colIndex) {
                            me.plugins[0].startEdit(rowIndex,0);
                        }
                    },
                    {
                        iconCls: 'button-remove',
                        tooltip: 'Remove',
                        handler: function (grid, rowIndex, colIndex) {
                            this.up('grid').fireEvent('removeRow', grid, rowIndex, colIndex);
                        }
                    }
                ]
            }
        ];
        //parent
        this.callParent(arguments);
    }
});