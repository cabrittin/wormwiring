/**
* wwapps module
*
*/


var wwapps = (function(){
    return {
	/* 
	 * Returns parameters passed in the URL.
	 * 
	 */
	loadURLParameters : function(){
	    var urlparams = location.search.substring(1).split("&");
	    var params = {}
	    for (var p in urlparams){
		var tmp = urlparams[p].split("=");
		params[tmp[0]] = tmp[1]
	    };
	    return params
	},

	loadIFrame : function(url,title){
	    var dialogText = [
		'<div class="importerdialog">',
		'<iframe src="'+url+'"',
		'id="infoFrame"></iframe>',
		'</div>',
	    ].join ('');
	    dialog = new FloatingDialog ();
	    dialog.Open ({
		className: 'infoFrame',
		title : title,
		text : dialogText,
		buttons : [
		    
		    {
			text : 'close',
			callback : function (dialog) {
			    dialog.Close();
		    
			}
		    }
		]
	    });	    
	}
    }
})();



class TopBar {
    /**
     * Class representing the top bar for apps.
     * @params (DOM) elemId : Id of container for the top bar.
     */
    constructor(elemId) {
	this.importerButtons = new ImporterButtons(elemId);
	this.dialog = new FloatingDialog();
    }
    
    /**
     *Adds a help button to the top bar.
     *@params (array) hparams: array of help panels.
     *
     * hparams has the format: [panel1, panel2, panel3]
     * where each panel is and array with format
     * { 'title' : Panel title,
     *   'text' : Text for the help dialog,
     *   'video' : Linke to youtube video illustrating the panel,
     *   'name' : css name for the panel
     * }
     */
    
    addHelp(hparams) {
	var self = this;
	this.importerButtons.AddLogo('Help',
				 function(){self.helpDialog(hparams)});	
    }
    
    /**
     *Adds the help dalog to the help button.
     *@params (array) params: array of help panels.
     *
     * params has the format: [panel1, panel2, panel3]
     * where each panel is and array with format
     * { 'title' : Panel title,
     *   'text' : Text for the help dialog,
     *   'video' : Linke to youtube video illustrating the panel,
     *   'name' : css name for the panel
     * }
     */
    
    helpDialog(params){
	var self = this;
	var dialogText = ['<div class="container"></div>'];
	this.dialog.Open ({
	    className: 'dialog',
	    title : 'Help',
	    text : dialogText,
	    buttons : [
    		{
		    text : 'close',
		    callback : function (dialog) {
			dialog.Close();
		    }
		}
	    ]
	});
    
	var container = document.getElementsByClassName('container')[0];
	var panelGroup = document.createElement('div');
	panelGroup.id = 'accordion';
	panelGroup.className = 'panel-group';
	for (var i = 0; i < params.length; i++){
	    this.addHelpPanel(panelGroup,params[i]);
	};
	container.appendChild(panelGroup);
    }
    
    /**
     *Adds a single help panel.
     *@params (DOM Id) parent: the parent container
     *@params (array) params: array of help panels.
     *
     * params has the format:
     * { 'title' : Panel title,
     *   'text' : Text for the help dialog,
     *   'video' : Linke to youtube video illustrating the panel,
     *   'name' : css name for the panel
     * }
     */
   
    addHelpPanel(parent,params){
	var self = this;
	var panel = document.createElement('div');
	panel.className = 'panel panel-default';
	var panelHeader = document.createElement('div');
	panelHeader.className = 'panel-heading';
	var panelTitle = document.createElement('h4');
	panelTitle.className = 'panel-title';
	var panelA = document.createElement('a');
	panelA.className = 'accordion-toggle';
	panelA.setAttribute('data-toggle','collapse');
	panelA.setAttribute('data-parent','#accordion');
	panelA.href = '#' + params.name;
	panelA.innerHTML = params.title;
	panelTitle.appendChild(panelA);
	panelHeader.appendChild(panelTitle);
	panel.appendChild(panelHeader);
	var panelCollapse = document.createElement('div');
	panelCollapse.id = params.name;
	panelCollapse.className = 'panel-collapse collapse';
	if (typeof params.text !== "undefined"){
	    var panelBody = document.createElement('div');
	    panelBody.className = 'panel-body';
	    panelBody.innerHTML = params.text;
	    panelCollapse.appendChild(panelBody);
	};
	if (typeof params.video !== "undefined"){
	    var panelIFrame = document.createElement("iframe");
	    panelIFrame.setAttribute("width","1140");
	    panelIFrame.setAttribute("height","740");
	    panelIFrame.setAttribute("src",params.video);
	    panelCollapse.appendChild(panelIFrame);
	};
	panel.appendChild(panelCollapse);
	parent.appendChild(panel);	
    }
    /**
    Adds a cell selector button to the top bar.
    @params (array) selectedCells: array of cells.
    @params (funciton) _callsback: Function that is called when cells are clicked.
    	
    selected cells has the format: {'group1':{cell1:{..},cell2:{..}...},'group2':{cell1:{..},cell2:{..}}}
    where cells are split into different groups.
    */
    
    addCellSelector(selectedCells,_callback){
	var self = this;
	this.importerButtons.AddLogo('Select cell',
				     function(){
					 self.cellSelectorDialog(selectedCells,
								 _callback)});	
    }	
    /**
    Links the cell selector dialog to the Cell Selector button.
    @params (array) selectedCells: array of cells.
    @params (funciton) _callsback: Function that is called when cells are clicked.
    	
    selected cells has the format: {'group1':{cell1:{..},cell2:{..}...},'group2':{cell1:{..},cell2:{..}}}
    where cells are split into different groups.
    */
    cellSelectorDialog(_selectedCells,_callback){
	var self = this;
	var dialogText = ['<div class="selectordialog"></div>'];
	this.dialog.Open ({
	    className: 'cell-selector',
	    title : 'Cell Selector',
	    text : dialogText,
	    buttons : [
	    {
		text : 'ok',
		callback : function (dialog) {
		    _callback();
		    dialog.Close();
		}
	    }
	    ]
	});
	var selectedCells = _selectedCells();
	var selector = document.getElementsByClassName('selectordialog')[0];
	for (var group in selectedCells){
	    this.addSelectPanel(selector,_selectedCells,group);
	};  
    }

    /*
     Adds a group panel to the cell selector dialog.
     @params (DOM id) parent: the DOM container id
     @params (array) selectedCells: Array of cells (see above)
     @params (string) name: the group name in the selectedCells array
     *
     */

    addSelectPanel(parent,_selectedCells,name){
	var selectedCells = _selectedCells();
	var self = this;
	var header = document.createElement('button');
	header.className = 'panel-header';
	header.setAttribute('type','button');
	header.setAttribute('data-toggle','collapse');
	header.setAttribute('data-target','#'+name);
	header.innerHTML = name
	var panel = document.createElement('div');
	panel.id = name;
	panel.className = 'collapse';
	for (var i in selectedCells[name]){
	    var div = document.createElement('div');
	    div.className = 'selectCell';
	    div.id = i;
	    div.innerHTML = i;
	    panel.appendChild(div);
	};
	parent.appendChild(header);
	parent.appendChild(panel);
    
	$("div#"+name+" > .selectCell").click(function () {
	    selectedCells[name][this.id].visible = 
		(selectedCells[name][this.id].visible==1)?0:1;
	    $(this).toggleClass("select");
	});
	
	for (var i in selectedCells[name]){
	    if (selectedCells[name][i].visible==1){
		$("div#"+i).toggleClass("select");  
	    };
	};	
    }

    /**
     * Adds a user defined button to the top bar
     * @params (string) name : Name of button
     * @params (function) callback : Function to be exected when button 
     *                               is presssed
     */
    
    addButton(name,callback){
	this.importerButtons.AddLogo(name,callback);
    }
}

class SideBar {
    /**
     * Class representing the side bar for apps.
     * @params (DOM) elemId : Id of container for the side bar.
     */
    constructor(elemId) {
	this.menuObj = new ImporterMenu(elemId);
	this.menuGroup = {}
    }

    /**
     * Adds a group to the side bar
     * @params (string) id: this.menuGroup key (id)
     * @params (string) name : Name of group
     * @params (bool) visible: Display the group upon loading (default false)
     */
    addDefaultGroup(id,name,visible=false) {
	this.menuGroup[id] = this.menuObj.AddGroup(name, {
	    openCloseButton : {
		visible : visible,
		open : './ww/apps/images/opened.png',
		close : './ww/apps/images/closed.png',
		title : 'Show/Hide ' + name
	    }
	});
    }

    addCustomGroup(params){
	this.addDefaultGroup(params.id,params.title,params.visible);
	params.callback(this.menuGroup[params.id]);
    }
    
    /**
     * Adds a series selector to side bar.
     * @params (object) params : Provides available data sets, brokendown by sex.
     * 
     * Format of params:
     * { 
     *  "herm" : [ { "value" : database name, "text" : displayed text}, ....]
     *  "male" : [ { "value" : database name, "text" : displayed text}, ....]
     * }
     */
    addSeriesSelector(params,_callback){
	//Add menu group
	this.addDefaultGroup('series-selector','Series selector',true)

	//Add sex selector
	this.menuObj.AddSelector(this.menuGroup['series-selector'],'Sex',{
	    options: params.sex,
	    onChange: function (){
		var sex = document.getElementById('sex-selector').value;
		var series = document.getElementById('series-selector')
		while(series.length > 0){
		    series.remove(series.length-1);
		};
		for (var i=0;i<params.series[sex].length;i++){
		    var opt = document.createElement('option');
		    opt.value = params.series[sex][i].value;
		    opt.innerHTML = params.series[sex][i].text;
		    series.appendChild(opt);
		};
		_callback();
	    },
	    id : 'sex-selector'
	});

	//Add series selector
	this.menuObj.AddSelector(this.menuGroup['series-selector'],'Series',{
	    options: params.series[Object.keys(params.series)[0]],
	    onChange:function(){
		_callback();
	    },
	    id : 'series-selector'
	});	
	
    }

    addInfoPanel(params){
	this.addDefaultGroup(params.id,params.title,true);

	for (var i in params.info){
	    var left = document.createElement('div');
	    var right = document.createElement('div');
	    left.className = 'infoLeft';
	    right.className = 'infoRight';
	    left.innerHTML = params.info[i][0];
	    right.innerHTML = params.info[i][1];
	    right.id = i;
	    this.menuGroup[params.id].appendChild(left);
	    this.menuGroup[params.id].appendChild(right);
	}

    }

    addDropDown(params){
	this.addDefaultGroup(params.id,params.title,true);
	this.menuObj.AddSelector(this.menuGroup[params.id],params.label,{
	    options: params.options,
	    onChange:params.onChange,
	    id:params.id
	});
    }

    addRadioSelect(params){
	this.addDefaultGroup(params.id,params.title,true);
	this.menuObj.AddRadioSelect(this.menuGroup[params.id],params);	
    }

    addSubItem(groupID,mapname,params){
	this.menuObj.AddSubItem(this.menuGroup[groupID],mapname,params);
    }
}
