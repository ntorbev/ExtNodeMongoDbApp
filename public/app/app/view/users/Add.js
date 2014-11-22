Ext.define('NickApp.view.users.Add', {
    extend: 'Ext.window.Window',
    alias: 'widget.usersAdd',
    width: 340,
    resizable: false,
    title: 'Add user',
    modal: true,
    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'form',
                    bodyPadding: 10,
                    title: '',
                    defaults: { // defaults are applied to items, not the container
                        allowBlank: false,
                        allowOnlyWhitespace: false,
                        labelAlign:"right",
                        labelWidth:70,
                        msgTarget: 'side',
                        xtype: 'textfield',
                        anchor: '100%'
                    },
                    items: [
                        {
                            fieldLabel: 'Login',
                            name: 'login',
                            minLength: 4
                        },
                        {
                            fieldLabel: 'First Name',
                            name: 'firstName'
                        },
                        {
                            fieldLabel: 'Last Name',
                            name: 'lastName'
                        },
                        {
                            fieldLabel: 'Email',
                            name: 'email',
                            vtype: 'email'
                        },
                        {
                            fieldLabel: 'Comments',
                            name: 'comments',
                            type:"string"
                        }
                    ],
                    bbar: [
                        '->',
                        {
                            xtype: 'button',
                            cls:'x-btn-default-small',
                            anchor: 0,
                            itemId: 'save',
                            text: 'Save'
                        },
                        { xtype: 'tbseparator' },
                        {
                            xtype: 'button',
                            cls:'x-btn-default-small',
                            anchor: 0,
                            itemId: 'cancel',
                            text: 'Cancel'
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});