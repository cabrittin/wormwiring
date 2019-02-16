ImporterApp = function (args,configFile)
{
    this.args = args;
    this.configFile = configFile;
    this.csg = {}
    this.validCells = [];
    this.neuronGroup = null;
    this.data = {};
    this.menuGroup = {};
    this.selectedNeurons = {};
    
};

ImporterApp.prototype.Init = function()
{
    var self = this
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
            self.cfg = JSON.parse(this.responseText);
	    self.GetCellDisplay(function(){self.SetupPage()});
	}
    };
    xmlhttp.open("GET", this.configFile, true);
    xmlhttp.send();    
};


ImporterApp.prototype.SetupPage = function()
{
    var self = this;
    var params = {};
    
    //Check that webgl is 
    if (!Detector.webgl){
	var warning = Detector.getWebGLErrorMessage();
	alert(warning);
    };

    //Add left side bar
    var side = document.getElementById('menu');
    this.sidebar = new SideBar(side);
    this.sidebar.addDefaultGroup('maps','Maps',true);
    this.sidebar.addSeriesSelector(this.cfg,function(){self.GetCellDisplay()});

    params = {
	'id' : 'synapse-info',
	'title':'Synapse info',
	'info':{
	    'cellname':['Cell: ','----'],
	    'syntype':['Synapse type: ','----'],
	    'synsource':['Source: ','----'],
	    'syntarget':['Target: ','----'],
	    'synweight':['# EM sections: ','----'],
	    'synsection':['Sections: ','----'],
	    'syncontin':['Synapse Id: ','----']
	}
    };
    this.sidebar.addInfoPanel(params);

    params = {
	'id' : 'synapse-filter',
	'title' : 'Synapse Filter',
	'visible' : true,
	'callback' : function(parent){self.SynapseFilter(parent)}
    };
    this.sidebar.addCustomGroup(params);
    
    params = {
	'id' : 'map-translate',
	'title' : 'Map translate',
	'visible' : true,
	'callback' : function(parent){self.MapTranslate(parent)}
    };
    this.sidebar.addCustomGroup(params);

    params = {
	'id' : 'comments',
	'title' : 'Comments',
	'visible' : true,
	'callback' : function(parent){self.ToggleAxes(parent)}
    };
    this.sidebar.addCustomGroup(params);

    //Add top bar
    var top = document.getElementById('top');
    this.topbar = new TopBar(top);
    this.topbar.addHelp(this.cfg.help);
    this.topbar.addCellSelector(function(){return self.GetCells()},
	    			function(){self.CellSelector()});  
    this.topbar.addButton('Clear maps', function () {self.ClearMaps()})

    //Window resize
    window.addEventListener ('resize', this.Resize.bind (this), false);
    this.Resize ();

    //Initialize the Mesh viewer
    var canvas = document.getElementById('meshviewer');
    var viewer = new MapViewer(canvas,
			       {menuObj:this.menuObj,
				meshGroup:this.menuGroup['mesh-group']},
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
    
    if (this.args.db != null && this.args.cell != null && this.args.sex != null){
	this.PreloadCell();
    };
};

ImporterApp.prototype.PreloadCell = function()
{
    var self = this;
    this.LoadMap(this.args.db,this.args.cell);
    document.getElementById('sex-selector').value = this.args.sex
    document.getElementById('series-selector').value = this.args.db
    var sex = document.getElementById('sex-selector').value;
    var series = document.getElementById('series-selector').value;
    var xhttp = new XMLHttpRequest();
    var url = this.cfg.cell_selector + '?sex=' + this.args.sex + '&db=' + this.args.db;
    xhttp.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200){
            self.selectedNeurons = JSON.parse(this.responseText);
            for (var group in self.selectedNeurons){
                if (self.args.cell in self.selectedNeurons[group]){
                    self.selectedNeurons[group][self.args.cell].visible = 1;
                    self.selectedNeurons[group][self.args.cell].plotted = 1;
                    self.LoadMapMenu(self.args.cell,
                                     self.selectedNeurons[group][self.args.cell].walink);
                };
            };
        };
    };

    xhttp.open("GET",url,true);
    xhttp.send();
   
}

ImporterApp.prototype.GetCells = function(){
    return this.selectedNeurons;
};


ImporterApp.prototype.GetCellDisplay = function(_callback)
{
    var self = this;
    var sex = this.cfg.sex_default;
    var db = this.cfg.db_default;
    if (document.getElementById('sex-selector') != null){
	sex = document.getElementById('sex-selector').value
    };
    if (document.getElementById('sex-selector') != null){
	db = document.getElementById('series-selector').value;    
    };
    var xhttp = new XMLHttpRequest();    
    var url = this.cfg.cell_selector + '?sex=' + sex +'&db='+ db;
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    self.selectedNeurons = JSON.parse(this.responseText);
	    if (_callback != undefined){_callback()};
	};
    };

    xhttp.open("GET",url,true);
    xhttp.send();
   
};
ImporterApp.prototype.CellSelector = function(){
    var db = document.getElementById('series-selector').value;
    for (var group in this.selectedNeurons){
	for (var i in this.selectedNeurons[group]){
	    var viznoplot = this.selectedNeurons[group][i].visible == 1
		&& this.selectedNeurons[group][i].plotted == 0;
	    if (viznoplot){
		this.LoadMap(db,i);
		this.LoadMapMenu(i,this.selectedNeurons[group][i].walink);
		this.selectedNeurons[group][i].plotted = 1;
	    };
	};
    };
}

ImporterApp.prototype.LoadMap = function(db,mapname)
{
    var self = this;
    console.log(db + ', ' + mapname);
    var url = this.cfg.coordinate_loader + '?neuron='+mapname+'&db='+db;
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
    var params = {
	openCloseButton : {
	    visible : false,
	    open: this.cfg.info_button,
	    close: this.cfg.info_button,
	    onOpen : function(content,mapName){
		while(content.lastChild){
		    content.removeChild(content.lastChild);
		};
		self.sidebar.menuObj.AddSubItem(content,'Color',self.ColorParams(mapName));
		self.sidebar.menuObj.AddSubItem(content,'Remarks',self.RemarksParams(mapName));
		if (walink != undefined){
		    self.sidebar.menuObj.AddSubItem(content,'WormAtlas',self.WAParams(mapName,walink));
		};
		self.sidebar.menuObj.AddSubItem(content,'Synaptic partners',self.PartnerListParams(mapName));
		self.sidebar.menuObj.AddSubItem(content,'Synapse list',self.SynapseListParams(mapName));
	    },
	    title : 'Show/Hide Information',
	    userData : mapname
	},
	userButton : {
	    visible : true,
	    onCreate : function(image){
		image.src = self.cfg.user_button_visible;
	    },
	    onClick : function(image,modelName){
		var visible = self.viewer.maps[modelName].visible
		image.src = visible ? self.cfg.user_button_hide : self.cfg.user_button_visible;
		self.viewer.maps[modelName].visible = !visible;
		self.viewer.toggleMaps(modelName);
		self.viewer._toggleAllSynapses(modelName,!visible);
		self.viewer._toggleRemarks(modelName,bool=false);		
	    },
	    title : "Show/Hide map",
	    userData : mapname
	}
    };

    this.sidebar.addSubItem('maps',mapname,params); 
}

ImporterApp.prototype.ClearMaps = function()
{
    var menuGroup = this.sidebar.menuGroup['maps'];
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

ImporterApp.prototype.ColorParams = function(mapname)
{
    var self = this;
    
    return {
	openCloseButton:{
	    open : this.cfg.open_button,
	    close : this.cfg.close_button,
	    title : 'Map color',
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
	    userdata : mapname
	}
    }

}

ImporterApp.prototype.RemarksParams = function(mapname)
{
    var self = this;
    return {
	userButton:{
	    visible: false,
	    onCreate : function(image){
		image.src = self.cfg.user_button_hide;
	    },
	    onClick : function(image,modelName){
		var visible = self.viewer.maps[mapname].params.remarks;
		self.viewer._toggleRemarks(mapname);
		image.src = visible ? self.cfg.user_button_hide : self.cfg.user_button_visible;
		self.viewer.maps[mapname].params.remarks = !visible;
	    },
	    title : 'Show/Hide remarks',
	    userdata : mapname
	}
    }
}

ImporterApp.prototype.WAParams = function(mapname,walink)
{
    var self = this;
    return {
	openCloseButton:{
	    visible : false,
	    open : this.cfg.info_button,
	    close: this.cfg.info_button,
	    title: 'WormAtlas',
	    onOpen : function(content,mapName){
		var url = walink;
		wwapps.loadIFrame(url,'WormAtlas');
	    },
	    userDate : mapname
	}
    };  

}

ImporterApp.prototype.PartnerListParams = function(mapname)
{
    var self = this;
    return {
	openCloseButton:{
	    visible : false,
	    open : this.cfg.info_button,
	    close: this.cfg.info_button,
	    title: 'Synaptic partners',
	    onOpen : function(content,mapName){
		var sexSelect = document.getElementById('sex-selector').value;
		var seriesSelect = document.getElementById('series-selector').value;
		var url = self.cfg.partnerList + '?cell='+mapname+'&db='+seriesSelect;
		wwapps.loadIFrame(url,'Synaptic partners');
	    },
	    userDate : mapname
	}	
    };
}

ImporterApp.prototype.SynapseListParams = function(mapname)
{
    var self = this;
    return {
	openCloseButton:{
	    visible : false,
	    open : this.cfg.info_button,
	    close: this.cfg.info_button,
	    title: 'Synaptic partners',
	    onOpen : function(content,mapName){
		var sexSelect = document.getElementById('sex-selector').value;
		var seriesSelect = document.getElementById('series-selector').value;
		var url = self.cfg.synapseList + '?cell='+mapname+'&db='+seriesSelect;
		wwapps.loadIFrame(url,'Synapse list');
	    },
	    userDate : mapname
	}	
    };
}

ImporterApp.prototype.SynapseFilter = function(parent){
    var self = this;
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

ImporterApp.prototype.MapTranslate = function(parent)
{
    var self = this;
    var params = {
	className:'map-translate',
	min: -2000,
	max: 2000,
	value: 0,
	callback:function(x,y,z){self.viewer.translateMaps(x,y,z)}
    };
    var text = {
	x:'<-Left / Right->',
	y:'<-Ventral / Dorsal->',
	z:'<-Anterior / Posterior->'
    };
    for (var i in text){
	var p = document.createElement('p')
	p.innerHTML = text[i] + ': '
	parent.appendChild(p);
	this.AddSlider(parent,i,params);
    };
};

ImporterApp.prototype.AddSlider = function(parent,name,params)
{
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

ImporterApp.prototype.ToggleAxes = function(parent)
{
    var self = this;
    var onText = "Axes ON";
    var offText = "Axes OFF";
    var remarkBtn = document.createElement('button');
    remarkBtn.innerHTML = onText;
    remarkBtn.value = true;
    remarkBtn.className = 'filterbutton';
    //remarkBtn.id = 'remarkBtn';
    remarkBtn.onclick = function(){
	this.innerHTML=(this.innerHTML==onText)?offText:onText;
	self.viewer.toggleAxes();
    };
    parent.appendChild(remarkBtn);	    
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
	
	this.topbar.dialog.Resize ();
};
