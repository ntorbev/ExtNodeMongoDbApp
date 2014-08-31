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
//                        {
//
//                            xtype: 'filefield',
//                            fieldLabel: 'File upload',
//                            name: 'photo',
//                            id: 'form-file',
//                            buttonText: 'Select Photo...'
//                        }
                    ],
//                    buttons: [{
//                        text: 'Upload',
//                        handler: function() {
//                            var form = this.up('form').getForm();
//                            if(form.isValid()){
//                                form.submit({
//                                    url: '/users',
//                                    waitMsg: 'Uploading your photo...',
//                                    success: function(fp, o) {
//                                        Ext.Msg.alert('Success', 'Your photo "' + o.result.file + '" has been uploaded.');
//                                    }
//                                });
//                            }
//                        }
//                    }],
                    bbar: [
                        '->',
    //                        {
    //                            fieldLabel: 'PIN Number',
    //                            name: 'pin',
    //                            minLength: 4,
    //                            maxLength: 4,
    //                            vtype: ['pin', 'digits']
    //                        },
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