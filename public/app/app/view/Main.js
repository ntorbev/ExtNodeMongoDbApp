Ext.define('NickApp.view.Main', {
    extend: 'Ext.container.Container',
    requires:[
        'Ext.tab.Panel',
        'Ext.layout.container.Border',
        'Ext.grid.Panel'
    ],
    xtype: 'app-main',
    layout: {
        type: 'border'
    },
    items: [
        {
            title: 'Picture Info',
            PictureInfo:true,
            region: 'west',
            xtype: 'panel',
            width: 150,
            collapsible:true,
            items:[
                {
                    xtype:'imagecomponent',
                    src: 'http://www.sencha.com/img/apple-touch-icon.png',
                    width: 150,
                    height: 200
                }
            ]
        },
        {
            xtype:'usersList',
            region: 'center'
        },
        {
            title: 'Finished Tasks',
            region: 'east',     // position for region
            xtype: 'panel',
            height: 200,
            width: 300,
//            store:'FinishedTask',
            collapsible:true,
            items:[
                {
                    xtype:'grid',
                    store:'FinishedTask',
                    columns: [
                        { text: 'Last update', dataIndex: 'time', flex: 1 },
                        { text: 'comments', dataIndex: 'comments' }
                    ]
                }
            ]
        },
        {
            title: 'working tasks',
            region: 'south',     // position for region
            xtype: 'panel',
            collapsible:true,
            height: 100,
            split: true
        }
    ]
});