ImporterApp = function (params)
{
    this.params = params;
    this.db = 'JSH';
    this.selectedCell = '';
    this.validCells = [];
    this.GetCellDisplay();
    this.neuronGroup = null;

    this.series = {
	herm : [
	    {value: 'N2U', text: 'Adult head (N2U)'},
	    {value: 'JSE', text: 'Adult tail (JSE)'},
	    {value: 'N2W', text: 'Pharynx (N2W)'},
	    {value: 'JSH', text: 'L4 head (JSH)'}
	],
	male : [
	    {value: 'n2y', text: 'Adult tail (N2Y)'},
	    {value: 'n930', text: 'Adult head (N930)'}
	]
    };
    this.data = {};
    this.menuGroup = {};
    this.selectedNeurons = {};

    this.helpParams =  [
	{
	    title : 'Quick start',
	    text : 'Cell skeletons are intially displayed in blue. This can be altered in the maps menu. Cell bodies are displayed as thicker red segements. ' + 
		'This color cannot be changed. Presynapses are pink, postsynapses are purple and gap junctions are blue spheres. ' + 
		'For presyanpses, the cell is the presynaptic partner. For the postsynapses, the cell is the postsynaptic partners. ' +
		'The size of the sphere reflects the size of the synapse. Mousing over displays the synapse info in the menu. ' + 
		'Clicking on the synapse takes the user to the electron micrographs where the synapse was scored. ' +
		'Left mouse button rotates the mapse. Mouse wheel zooms in/out of the maps. Right mouse button pans the maps.',
	    video: 'https://www.youtube.com/embed/hySW0Q57iL4',	    
	    name : 'help-display'
	},
	{
	    title : 'Cell selector',
	    text : 'First select the sex and data series from the dropdown menus on the left. Then click on the Select Neuron button.',
	    video: 'https://www.youtube.com/embed/l_oCC-3GdVQ',
	    name : 'help-series'
	},
	{
	    title : 'Synapse info',
	    text : 'Synapses are represented as spheres. Mousing over synapse to display info for that synapse in the left panel. '+
		'There are three types of synapses: presynapses (pink), ' +
		'postsynapses (purple), and gap junctions (blue). For presynapses and postsynapses, the cel pre- and postsynaptic, respectively. ' +
		'The info dialog gives the the cell on which the synapse sphere is located (Cell), the synapse type, the presynaptic source, ' +
		'the postsynaptic target, the estimated volume of the synapse (# of EM sections), the sections over which the synapse occurs ' +
		'and numerical id of the synapse.',
	    video: 'https://www.youtube.com/embed/DDjFMjFSdO0',
	    name : 'help-synapse-info'
	},
	{
	    title : 'Synapse Viewer',
	    text : 'Click on synapse sphere to view the synapse in the associated electron micrograph (EM). The synapse viewer '+
		'has both a high and low magnification. Use the dropdown to to select the a different EM section in which the '+
		'was scored.',
	    video: 'https://www.youtube.com/embed/Qiy6JO2YeDU',
	    name : 'help-synapse-viewer'
	},
	{
	    title : 'Synapse filter',
	    text : 'Display only the selected synapses. Check presynaptic (Pre.), postsynaptic (Post.) or gap junction (Gap.).'+
		'Then enter the partner cells to keep. Mulitple cells should be separated by a comma (e.g. AVAL,ASHL).'+
		'You can also select synapses by synapse id number. ' +
	        'Filter button will hide all but the selected synapses. Restore button makes all synapses visible.',
	    video: 'https://www.youtube.com/embed/1vGvdg3cUlY',
	    name : 'help-filter'
	},
	{
	    title : 'Map translate',
	    text : 'Translate the map along the x, y and z axes. Some maps may not be centered when selected. This can be used to manually center the maps.',
	    video: 'https://www.youtube.com/embed/23dytw_7yRM',
	    name : 'help-translate'
	},
	{
	    title : 'Comments',
	    text : 'Toggle map comments on/off.',
	    video: 'https://www.youtube.com/embed/D25joOnz1XE',
	    name : 'help-comments'
	},
	{
	    title : 'Maps',
	    text : 'Displays info for each map. Visibility of each map can be toggled on/off with the eye icon. Clicking on the cell reveals map info. ' + 
		'Map color can be changed. Map remarks toggled on/off. If a WormAtlas link exists it can be accessed. Synaptic partners and synapse partners ' +
		'can also be displayed.',
	    video: 'https://www.youtube.com/embed/9aVMiiGVwYA',
	    name : 'help-maps'
	},
	{
	    title : 'Clear maps',
	    text : 'Clears all maps. Maps can also be cleared with the browser refresh button.',
	    video: 'https://www.youtube.com/embed/LT3PTMcnFAo',
	    name : 'help-clear'
	}	
    ];

    
};

ImporterApp.prototype.Init = function ()
{
    
    
    if (!Detector.webgl){
	var warning = Detector.getWebGLErrorMessage();
	alert(warning);
    };
    
   
    var self = this;
    var top = document.getElementById ('top');
    var importerButtons = new ImporterButtons (top);
    importerButtons.AddLogo('Help',function(){self.HelpDialog();});
    importerButtons.AddLogo ('Select neuron', function () { self.NeuronSelectorDialog (); });
    importerButtons.AddLogo ('Clear maps', function () {self.ClearMaps();});

    
	
    this.dialog = new FloatingDialog ();

    window.addEventListener ('resize', this.Resize.bind (this), false);
    this.Resize ();
    
    var canvas = document.getElementById('meshviewer');

    
    this.GenerateMenu();
    
    var viewer = new MapViewer(canvas,
				{menuObj:this.menuObj,
				 menuGroup:this.menuGroup,
				synClick: this.InfoDialog},
				debug=false);
    this.viewer = viewer;

    var resizeWindow = function(){
	viewer.resizeDisplayGL();
    };
    
    var render = function(){
	
	requestAnimationFrame(render);
	self.viewer.render();
    };

    window.addEventListener('resize',resizeWindow,false);
    
    this.viewer.initGL();
    this.viewer.resizeDisplayGL();
    render();
    
    if (this.PreloadParamsLoaded()){
	this.PreloadCells();
    } else {
	this.SetCellSelector();
    };
	
};

ImporterApp.prototype.PreloadParamsLoaded = function()
{
    if ("cell" in this.params && "db" in this.params && "sex" in this.params){
	return true;
    } else {
	return false;
    };
};

ImporterApp.prototype.PreloadCells = function()
{
    var self = this;
    this.LoadMap(this.params.db,this.params.cell);
    document.getElementById('sex-selector').value = this.params.sex
    var sex = document.getElementById('sex-selector').value;
    var series = document.getElementById('series-selector')
    while(series.length > 0){
	series.remove(series.length-1);
    };
    for (var i=0;i<self.series[sex].length;i++){
	var opt = document.createElement('option');
	opt.value = self.series[sex][i].value;
	opt.innerHTML = self.series[sex][i].text;
	series.appendChild(opt);
    };
    document.getElementById('series-selector').value = this.params.db
    var xhttp = new XMLHttpRequest();    
    var url = '../php/selectorCells.php?sex='+this.params.sex+'&db='+this.params.db;
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    self.selectedNeurons = JSON.parse(this.responseText);
	    for (var group in self.selectedNeurons){
		if (self.params.cell in self.selectedNeurons[group]){
		    self.selectedNeurons[group][self.params.cell].visible = 1;
		    self.selectedNeurons[group][self.params.cell].plotted = 1;
		    self.LoadMapMenu(self.params.cell,
				     self.selectedNeurons[group][self.params.cell].walink);
		};
	    };
	};
    };
    
    xhttp.open("GET",url,true);
    xhttp.send(); 
    
}

ImporterApp.prototype.HelpDialog = function()
{
    var self = this;
    var dialogText = [
	'<div class="container">',
	'</div>',
    ].join ('');
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
    for (var i = 0; i < this.helpParams.length; i++){
	this.AddHelpPanel(panelGroup,this.helpParams[i]);
    };
    container.appendChild(panelGroup);
}

ImporterApp.prototype.AddHelpPanel = function(parent,params)
{
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
	panelIFrame = document.createElement("iframe");
	panelIFrame.setAttribute("width","1140");
	panelIFrame.setAttribute("height","740");
	panelIFrame.setAttribute("src",params.video);
	panelCollapse.appendChild(panelIFrame);
    };
    panel.appendChild(panelCollapse);
    parent.appendChild(panel);
}

ImporterApp.prototype.InfoDialog = function(url,title)
{
    var self = this;
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

ImporterApp.prototype.NeuronSelectorDialog = function()
{
    var self = this;


    var dialogText = [
	'<div class="selectordialog">',
	//this.NeuronSelector (),
	'</div>',
    ].join ('');
    this.dialog.Open ({
	className: 'cell-selector',
	title : 'Cell Selector',
	text : dialogText,
	buttons : [
    
	    {
		text : 'ok',
		callback : function (dialog) {
		    var sex = document.getElementById('sex-selector').value;
		    var series = document.getElementById('series-selector').value;
		    for (var group in self.selectedNeurons){
			for (var i in self.selectedNeurons[group]){
			    if (self.selectedNeurons[group][i].visible == 1 && self.selectedNeurons[group][i].plotted == 0){
				self.LoadMap(series,i);
				self.LoadMapMenu(i,self.selectedNeurons[group][i].walink);
				self.selectedNeurons[group][i].plotted = 1;
			    };
			};
		    };
		    dialog.Close();
		}
	    }
	]
    });

    //this.SetCellSelector();
    var selector = document.getElementsByClassName('selectordialog')[0];
    for (var group in this.selectedNeurons){
	this.AddSelectPanel(selector,group);
    };  

}

ImporterApp.prototype.ClearMaps = function(mapName)
{
    var menuGroup = this.menuGroup.maps;
    while(menuGroup.lastChild){
	menuGroup.removeChild(menuGroup.lastChild);
    };
    this.viewer.clearMaps();

    for (var group in this.selectedNeurons){
	for (var i in this.selectedNeurons[group]){
	    if (this.selectedNeurons[group][i].visible==1){
		this.selectedNeurons[group][i].visible=0;
	    };
	};
    }; 
}

ImporterApp.prototype.LoadMap = function(db,mapname)
{
    var self = this;
    console.log(db + ', ' + mapname);
    var url = '../php/retrieve_trace_coord.php?neuron='+mapname+'&db='+db;
    var xhttp = new XMLHttpRequest();    
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    self.data[mapname] = JSON.parse(this.responseText);
	    self.viewer.loadMap(self.data[mapname]);
	}
    };
    xhttp.open("GET",url,true);
    xhttp.send();
}



ImporterApp.prototype.LoadMapMenu = function(mapname,walink)
{
    var self = this;
    var menuObj = this.menuObj;
    var menuGroup = this.menuGroup.maps;    
    var colorparams = 
	{
	    openCloseButton:{
		visible : false,
		open : 'images/opened.png',
		close: 'images/closed.png',
		title: 'Map color',
		onOpen : function(content,mapName){
		    while(content.lastChild){
			content.removeChild(content.lastChild);
		    };
		    colorInput = document.createElement('input');
		    colorInput.className = 'colorSelector';
		    colorInput.setAttribute('type','text');
		    var obj = self.viewer.maps[mapname].skeleton[0];
		    var r = Math.round(255*obj.material.color.r);
		    var b = Math.round(255*obj.material.color.b);
		    var g = Math.round(255*obj.material.color.g);
		    var rgb = b | (g << 8) | (r << 16);
		    var hex = '#' + rgb.toString(16);
		    colorInput.setAttribute('value',hex);
		    content.appendChild(colorInput);
		    $(".colorSelector").spectrum({
			preferredFormat: "rgb",
			showInput: true,
			move: function(color){
			    var rgb = color.toRgb();
			    for (var i in self.viewer.maps[mapname].skeleton){
				var obj = self.viewer.maps[mapname].skeleton[i];
				if (!obj.cellBody){
				    obj.material.color.r = rgb.r/255.;
				    obj.material.color.g = rgb.g/255.;
				    obj.material.color.b = rgb.b/255.;
				};
			    };
			}
		    });
		},
		userDate : mapname
	    }
	};
    
    var remarksparams = 
	{
	    userButton:{
		visible: false,
		onCreate : function(image){
		    image.src = 'images/hidden.png';
		},
		onClick : function(image,modelName){
		    var visible = self.viewer.maps[mapname].params.remarks;
		    self.viewer._toggleRemarks(mapname);
		    image.src = visible ? 'images/hidden.png' : 'images/visible.png';
		    self.viewer.maps[mapname].params.remarks = !visible;
		},
		title : 'Show/Hide remarks',
		userdata : mapname
	    }
	    
	};

    var infoparams = 
	{
	    openCloseButton:{
		visible : false,
		open : 'images/info.png',
		close: 'images/info.png',
		title: 'WormAtlas',
		onOpen : function(content,mapName){
		    var url = walink;
		    self.InfoDialog(url,'WormAtlas');
		},
		userDate : mapname
	    }
	};  

    var partnerListparams = 
	{
	    openCloseButton:{
		visible : false,
		open : 'images/info.png',
		close: 'images/info.png',
		title: 'Synaptic partners',
		onOpen : function(content,mapName){
		    var sexSelect = document.getElementById('sex-selector').value;
		    var seriesSelect = document.getElementById('series-selector').value;
		    var url = '../partnerList/?continName='+mapname+'&series='+seriesSelect;
		    console.log('url: ' + url); 
		    self.InfoDialog(url,'Synaptic partners');
		},
		userDate : mapname
	    }
	}; 

    var synapseListparams = 
	{
	    openCloseButton:{
		visible : false,
		open : 'images/info.png',
		close: 'images/info.png',
		title: 'Synapes',
		onOpen : function(content,mapName){
		    var sexSelect = document.getElementById('sex-selector').value;
		    var seriesSelect = document.getElementById('series-selector').value;
		    var url = '../synapseList/?continName='+mapname+'&series='+seriesSelect;
		    self.InfoDialog(url,'Synapse list');
		},
		userDate : mapname
	    }
	};

    menuObj.AddSubItem(menuGroup,mapname,
		       {
			   openCloseButton:{
			       visible : false,
			       open: 'images/info.png',
			       close: 'images/info.png',
			       onOpen : function(content,mapName){
				   while(content.lastChild){
				       content.removeChild(content.lastChild);
				   };
				   menuObj.AddSubItem(content,'Color',colorparams);
				   menuObj.AddSubItem(content,'Remarks',remarksparams);
				   if (walink != undefined){menuObj.AddSubItem(content,'WormAtlas',infoparams);}
				   menuObj.AddSubItem(content,'Synaptic partners',partnerListparams);
				   menuObj.AddSubItem(content,'Synapse list',synapseListparams);
			       },
			       title : 'Show/Hide Information',
			       userData : mapname
			   },
			   userButton : {
			       visible : true,
			       onCreate : function(image){
				   image.src = 'images/visible.png';
			       },
			       onClick: function(image,modelName){
				   var visible = self.viewer.maps[modelName].visible
				   image.src = visible ? 'images/hidden.png' : 'images/visible.png';
				   self.viewer.maps[modelName].visible = !visible;
				   self.viewer.toggleMaps(modelName);
				   self.viewer._toggleAllSynapses(modelName,!visible);
				   self.viewer._toggleRemarks(modelName,bool=false);
			       },
			       title : 'Show/Hide map',
			       userData : mapname
			   }
		       });			    

}

ImporterApp.prototype.SetCellSelector = function()
{
    var self = this;
    var sex = document.getElementById('sex-selector').value
    var db = document.getElementById('series-selector').value;  
    var xhttp = new XMLHttpRequest();    
    var url = '../php/selectorCells.php?sex='+sex+'&db='+db;
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    self.selectedNeurons = JSON.parse(this.responseText);
	};
    };

    xhttp.open("GET",url,true);
    xhttp.send();  
};

ImporterApp.prototype.AddSelectPanel = function(parent,name)
{
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
    for (var i in this.selectedNeurons[name]){
	var div = document.createElement('div');
	div.className = 'selectCell';
	div.id = i;
	div.innerHTML = i;
	panel.appendChild(div);
    };
    parent.appendChild(header);
    parent.appendChild(panel);
    
    $("div#"+name+" > .selectCell").click(function () {
	self.selectedNeurons[name][this.id].visible = 
	    (self.selectedNeurons[name][this.id].visible==1)?0:1;
	$(this).toggleClass("select");
    });

    for (var i in this.selectedNeurons[name]){
	if (this.selectedNeurons[name][i].visible==1){
	    $("div#"+i).toggleClass("select");  
	};
    };
    
};

ImporterApp.prototype.SetDB = function(_db)
{
    this.db = _db;
}

ImporterApp.prototype.SetCell = function(_cell)
{
    this.selectedCell = _cell;
}

ImporterApp.prototype.HelpButton = function()
{
    var HelpText = [
	'<div class="btn-group">',
	'<button type="button" class="btn btn-danger">Action</button>',
	'<button type="button" class="btn btn-danger" data-toggle="collapse" data-target="#demo">',
	'<span class="glyphicon glyphicon-minus"></span>',
	'</button>',
	'</div>',
        '<div id="demo" class="collapse in">Some dummy text in here.</div>'
    ].join('');
    return HelpText;
}


ImporterApp.prototype.NeuronSelector = function()
{
    var VolSelectorText = [
	'<div class="cellclass-heading',
	'<a class="cellclass" data-toggle="neurons" href="#neurons">Neurons</a>',
	
    ].join('');
    
    return VolSelectorText;
};


ImporterApp.prototype.GetCellDisplay = function()
{
    var self = this;
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load",function(){
	var list = this.responseText.split('\n');
	for (l of list){
	    var tmp = l.split(',');
	    for (_tmp of tmp){
		self.validCells.push(_tmp);
	    };
	};
				  
    });
    //oReq.open("GET","./models/volcells.txt");
    //oReq.send();
}


ImporterApp.prototype.Resize = function ()
{
	function SetWidth (elem, value)
	{
		elem.width = value;
		elem.style.width = value + 'px';
	}

	function SetHeight (elem, value)
	{
		elem.height = value;
		elem.style.height = value + 'px';
	}

	var top = document.getElementById ('top');
	var left = document.getElementById ('left');
	var canvas = document.getElementById ('meshviewer');
	var height = document.body.clientHeight - top.offsetHeight;

	SetHeight (canvas, 0);
	SetWidth (canvas, 0);

	SetHeight (left, height);

	SetHeight (canvas, height);
	SetWidth (canvas, document.body.clientWidth - left.offsetWidth);
	
	this.dialog.Resize ();
};

ImporterApp.prototype.GenerateMenu = function()
{
    var self = this;
    function AddDefaultGroup (menu, name, visible=false)
    {
	var group = menu.AddGroup (name, {
	    openCloseButton : {
		visible : visible,
		open : 'images/opened.png',
		close : 'images/closed.png',
		title : 'Show/Hide ' + name
	    }
	});
	return group;
    };



    function AddSexSelector(menu,menuGrp,name){
	
	menu.AddSelector(menuGrp,name,{
	    options:[{value:'herm',text:'Hermaphrodite'},
		     {value:'male',text:'Male'}],
	    onChange: function (){
		var sex = document.getElementById('sex-selector').value;
		var series = document.getElementById('series-selector')
		while(series.length > 0){
		    series.remove(series.length-1);
		};
		for (var i=0;i<self.series[sex].length;i++){
		    var opt = document.createElement('option');
		    opt.value = self.series[sex][i].value;
		    opt.innerHTML = self.series[sex][i].text;
		    series.appendChild(opt);
		};
		self.SetCellSelector();
	     },
	    id : 'sex-selector'
	    });
    };

    function AddSeriesSelector(menu,menuGrp,name){
	menu.AddSelector(menuGrp,name,{
	    options:self.series.herm,
	    onChange:function(){
		self.SetCellSelector();
	    },
	    id : 'series-selector'
	});	
    };

    function AddSynapseInfo(parent){
	var synElems = {
	    'cellname':'Cell: ',
	    'syntype':'Synapse type: ',
	    'synsource':'Source: ',
	    'syntarget':'Target: ',
	    'synweight':'# EM sections: ',
	    'synsection':'Sections: ',
	    'syncontin':'Synapse Id: '
	};
	
	for (var i in synElems){
	    var left = document.createElement('div');
	    var right = document.createElement('div');
	    left.className = 'synLeft';
	    right.className = 'synRight';
	    right.innerHTML = '---';	
	    left.innerHTML = synElems[i];	
	    right.id = i;
	    parent.appendChild(left);
	    parent.appendChild(right);
	};	

    };

    function AddSynapseFilter(parent){
	var filterChecks = document.createElement('div')
	filterChecks.id = 'synfiltercheck'
	var _filters = {
	    'Presynaptic':'Pre.',
	    'Postsynaptic':'Post.',
	    'Gap junction':'Gap'
	};
	
	for (var i in _filters){
	    var label = document.createElement('label')
	    var chkbx = document.createElement('input')
	    chkbx.type = 'checkbox';
	    chkbx.className = 'synfilter';
	    chkbx.id = i
	
	    label.appendChild(chkbx);
	    //label.innerHTML = _filters[i];
	    label.appendChild(document.createTextNode(_filters[i]));
	    filterChecks.appendChild(label);
	};
	parent.appendChild(filterChecks);
	var filterDialog = document.createElement('div');
	filterDialog.id = 'synfiltercellsdialog';
	var filterDialogLabel = document.createElement('label');
	filterDialogLabel.appendChild(document.createTextNode('Cells: '));
	var filterText = document.createElement('input');
	filterText.type = 'text';
	filterText.id = 'synfiltercells';
	filterDialogLabel.appendChild(filterText);
	filterDialog.appendChild(filterDialogLabel);
	parent.appendChild(filterDialog);
	var filterBtn = document.createElement('button');
	filterBtn.innerHTML = 'Filter';
	filterBtn.className = 'filterButton';
	filterBtn.onclick = function(){
	    self.viewer.toggleAllSynapses(false);
	    var cells = document.getElementById('synfiltercells').value
	    if (cells != ""){
		cells = cells.split(',');
	    } else {
		cells = null;
	    };
	    for (var i in _filters){
		if (document.getElementById(i).checked){
		    self.viewer.toggleSynapseType(i,cells=cells);
		};
	    };
	
	}
	var restoreBtn = document.createElement('button');
	restoreBtn.innerHTML = 'Restore';
	restoreBtn.className = 'filterButton';
	restoreBtn.onclick = function(){
	    document.getElementById('synfiltercells').value=null;
	    self.viewer.toggleAllSynapses(true);
	};
	parent.appendChild(filterBtn);
	parent.appendChild(restoreBtn);	

	var filterContinDialog = document.createElement('div');
	filterContinDialog.id = 'synfiltercellsdialog';
	var filterContinDialogLabel = document.createElement('label');
	filterContinDialogLabel.appendChild(document.createTextNode('Synapse Id: '));
	var filterContinText = document.createElement('input');
	filterContinText.type = 'text';
	filterContinText.id = 'synfiltercontins';
	filterContinDialogLabel.appendChild(filterContinText);
	filterContinDialog.appendChild(filterContinDialogLabel);
	parent.appendChild(filterContinDialog);	
	var filterBtn = document.createElement('button');
	filterBtn.innerHTML = 'Filter';
	filterBtn.className = 'filterContinButton';
	filterBtn.onclick = function(){
	    self.viewer.toggleAllSynapses(false);
	    var contins = document.getElementById('synfiltercontins').value
	    if (contins != ""){
		contins = contins.split(',');
	    } else {
		contins = null;
	    };
	    
	    if (contins != null){
		console.log(contins);
		for (var i in contins){
		    self.viewer.toggleSynapseContin(contins[i]);
		};
	    };
	}
	var restoreBtn = document.createElement('button');
	restoreBtn.innerHTML = 'Restore';
	restoreBtn.className = 'filterContinButton';
	restoreBtn.onclick = function(){
	    document.getElementById('synfiltercontins').value=null;
	    self.viewer.toggleAllSynapses(true);
	};
	parent.appendChild(filterBtn);
	parent.appendChild(restoreBtn);	

    };

    function AddMapTranslate(parent,slider,callback){
	var params = {className:'map-translate',
		      min: -2000,
		      max: 2000,
		      value: 0,
		     callback:callback};
	var text = {x:'<-Left / Right->',
		    y:'<-Ventral / Dorsal->',
		    z:'<-Anterior / Posterior->'};
	for (var i in text){
	    var p = document.createElement('p')
	    p.innerHTML = text[i] + ': '
	    parent.appendChild(p);
	    slider(parent,i,params);
	}

    };

    function AddSlider(parent,name,params){
	var self = this;
	var slider = document.createElement('input');
	slider.id = name + '-slider';
	slider.className = params.className;
	slider.type ='range';
	slider.min = params.min;
	slider.max = params.max;
	slider.value = params.value;
	slider.onchange = function(){
	    var x = document.getElementById('x-slider').value;
	    var y = document.getElementById('y-slider').value;
	    var z = document.getElementById('z-slider').value;
	    params.callback(-x,-y,-z);
	};
	parent.appendChild(slider);
    };

    function AddToggleButton(parent,onText,offText,callback){
	var remarkBtn = document.createElement('button');
	remarkBtn.innerHTML = onText;
	remarkBtn.value = true;
	remarkBtn.className = 'filterbutton';
	//remarkBtn.id = 'remarkBtn';
	remarkBtn.onclick = function(){
	    this.innerHTML=(this.innerHTML==onText)?offText:onText;
	    callback();
	};
	parent.appendChild(remarkBtn);	

	
    };

    var menu = document.getElementById('menu');
    this.menuObj = new ImporterMenu(menu);
    
    this.menuGroup['maps'] = AddDefaultGroup(this.menuObj,'Maps',visible=true);	
    this.menuGroup['series-selector'] =
	AddDefaultGroup(this.menuObj,'Series selector',visible=true);
    this.menuGroup['synapse-info'] = AddDefaultGroup(this.menuObj,'Synapse info',visible=true);
    this.menuGroup['synapse-filter'] = AddDefaultGroup(this.menuObj,'Synapse filter',visible=true);
    this.menuGroup['map-translate'] = AddDefaultGroup(this.menuObj,'Map translate',visible=true);
    this.menuGroup['comments'] = AddDefaultGroup(this.menuObj,'Comments',visible=true);
    //this.menuGroup['maps'] = AddDefaultGroup(this.menuObj,'Maps',visible=true);
    
    //Series selector
    AddSexSelector(this.menuObj,this.menuGroup['series-selector'],'Sex');
    AddSeriesSelector(this.menuObj,this.menuGroup['series-selector'],'Series');
    
    //Synapse info
    AddSynapseInfo(this.menuGroup['synapse-info']);

    //Synapse filter
    AddSynapseFilter(this.menuGroup['synapse-filter']);

    //Translate map
    AddMapTranslate(this.menuGroup['map-translate'],AddSlider,
		   function(x,y,z){self.viewer.translateMaps(x,y,z);});

    //Synapse remarks
    AddToggleButton(this.menuGroup['comments'],'Axes ON',
		    'Axes OFF',function(){self.viewer.toggleAxes();});
    //AddToggleButton(this.menuGroup['comments'],'Remarks OFF',
    //'Remarks ON',function(){self.viewer.toggleRemarks();});
    
};






