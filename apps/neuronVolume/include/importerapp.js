ImporterApp = function ()
{
    this.viewer = null;
    this.fileNames = null;
    this.inGenerate = false;
    this.dialog = null;
    this.menuObj = null;
    this.meshGroup = null;

    this.menuGroup = {}
    this.series = [
	{value: 'JSH', text: 'L4 head (JSH)'},
	{value: 'N2U', text: 'Adult head (N2U)'}
    ];
    
    
    this.selectedCell = '';
    this.validCells = {};
    this.selectedNeurons = {'neurons':{}};
    this.GetCellDisplay();

    this.helpParams =  [
	{
	    title : 'Quick start',
	    text : 'Volumes for both the L4 and adult nerve ring datasets. Use the Select Neuron button to select the cell. '+
		'Click cells then click OK. Left mouse button rotates the mapse. Mouse wheel zooms in/out of the maps. ' +
		'Right mouse button pans the maps. Please note that the adult series is not well aligned. Breaks and distortions in ' +
		'the adult data series are due to poor alignment.',
	    video: 'https://www.youtube.com/embed/aS3ve2MC0dc', 
	    name : 'help-display'
	}
    ];

};

ImporterApp.prototype.Init = function ()
{
    
    if (!Detector.webgl){
	var warning = Detector.getWebGLErrorMessage();
	alert(warning);
    };


    var myThis = this;
    var top = document.getElementById ('top');
    var importerButtons = new ImporterButtons (top);
    importerButtons.AddLogo('Help',function(){myThis.HelpDialog();});
    importerButtons.AddLogo ('Select neuron', function () { myThis.NeuronSelectorDialog (); });
    importerButtons.AddLogo ('Clear maps', function () {myThis.ClearMaps();});	

    this.dialog = new FloatingDialog ();

    window.addEventListener ('resize', this.Resize.bind (this), false);
    this.Resize ();
    
    var canvas = document.getElementById('meshviewer');
    this.GenerateMenu();
    var viewer = new MeshViewer(canvas,
				{menuObj:this.menuObj,
				 meshGroup:this.menuGroup['mesh-group']},
				debug=false);
    this.viewer = viewer;

    var resizeWindow = function(){
	viewer.resizeDisplayGL();
    };
    
    var render = function(){
	
	requestAnimationFrame(render);
	myThis.viewer.render();
    };

    window.addEventListener('resize',resizeWindow,false);
    
    this.viewer.initGL();
    this.viewer.resizeDisplayGL();

    render();

};

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
		    var db = document.getElementById('series-selector').value;
		    var dir = './models/' + db;
		    for (var i in self.selectedNeurons[group]){
			if (self.selectedNeurons[group][i].visible == 1 && self.selectedNeurons[group][i].plotted == 0){
			    self.viewer.loadModel(dir,i);
			    self.selectedNeurons[group][i].plotted = 1;
			};
		    };
	
		dialog.Close();
		}
	    }
	]
    });

    
    var selector = document.getElementsByClassName('selectordialog')[0];
    for (var group in this.selectedNeurons){
	this.AddSelectPanel(selector,group);
    };  

}

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

ImporterApp.prototype.ClearMaps = function(mapName)
{
    var menuGroup = this.menuGroup['mesh-group'];
    while(menuGroup.lastChild){
	menuGroup.removeChild(menuGroup.lastChild);
    };
    this.viewer.clearMesh();

    for (var group in this.selectedNeurons){
	for (var i in this.selectedNeurons[group]){
	    if (this.selectedNeurons[group][i].visible==1){
		this.selectedNeurons[group][i].visible=0;
	    };
	};
    }; 
}

ImporterApp.prototype.SetDB = function(_db)
{
    this.db = _db;
}

ImporterApp.prototype.SetCell = function(_cell)
{
    this.selectedCell = _cell;
}


ImporterApp.prototype.GetCellDisplay = function()
{
    var self = this;
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load",function(){
	var list = this.responseText.split('\n');
	for (l of list){
	    var tmp = l.split(',');
	    for (_tmp of tmp){
		self.selectedNeurons.neurons[_tmp] = {visible:0,plotted:0};
	    };
	};
				  
    });
    oReq.open("GET","../../cell_files/volcells.txt");
    oReq.send();
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


    function AddSeriesSelector(menu,menuGrp,name){
	menu.AddSelector(menuGrp,name,{
	    options:self.series,
	    onChange:function(){
		self.selectedNeurons = {'neurons':{}};	
		self.GetCellDisplay();
	    },
	    id : 'series-selector'
	});	
    };

    var self = this;
    var menu = document.getElementById('menu');
    this.menuObj = new ImporterMenu(menu);
    this.menuGroup['series-selector'] =
	AddDefaultGroup(this.menuObj,'Series selector',visible=true);
    this.menuGroup['mesh-group'] = AddDefaultGroup(this.menuObj,'Meshes',visible=true);

    AddSeriesSelector(this.menuObj,this.menuGroup['series-selector'],'Series');
    
};






