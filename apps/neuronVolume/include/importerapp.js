ImporterApp = function (args,configFile)
{
    this.args = args;
    this.configFile = configFile;
    this.cfg = {};
    this.viewer = null;
    this.fileNames = null;
    this.inGenerate = false;
    this.dialog = null;
    this.menuObj = null;
    this.meshGroup = null;
    this.menuGroup = {}
    this.series = [];
    this.selectedCell = '';
    this.validCells = {};
    this.selectedNeurons = {'neurons':{}};
};

ImporterApp.prototype.Init = function()
{
    var self = this;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
            self.cfg = JSON.parse(this.responseText);
	    self.SetupPage()	    
	}
    };
    xmlhttp.open("GET", this.configFile, true);
    xmlhttp.send(); 
};

ImporterApp.prototype.SetupPage = function ()
{
    var self = this;
    
    this.GetCellDisplay();

    //Check that webgl is installed
    if (!Detector.webgl){
	var warning = Detector.getWebGLErrorMessage();
	alert(warning);
    };

    //Load side menu
    var side = document.getElementById('menu');
    this.sidebar = new SideBar(side);
    this.sidebar.addSeriesSelector(this.cfg,function(){});
    this.sidebar.addDefaultGroup('mesh-group','Meshes',true);

    //Load top bar
    var top = document.getElementById ('top');
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
	self.viewer.render();
    };

    window.addEventListener('resize',resizeWindow,false);
    
    this.viewer.initGL();
    this.viewer.resizeDisplayGL();

    render();
};

ImporterApp.prototype.GetCells = function(){
    return this.selectedNeurons;
};


ImporterApp.prototype.CellSelector = function(){
    var db = document.getElementById('series-selector').value;
    var dir = this.cfg.models_dir + db;
    for (var group in this.selectedNeurons){
	for (var i in this.selectedNeurons[group]){
	    if (this.selectedNeurons[group][i].visible == 1 &&
		this.selectedNeurons[group][i].plotted == 0)
	    {
		this.viewer.loadModel(dir,i);
		this.LoadMeshMenu(i);
		this.selectedNeurons[group][i].plotted = 1;
	    };
	};
    };
	   
}


ImporterApp.prototype.LoadMeshMenu = function(meshname)
{
    var self = this;
    var params = {
	openCloseButton : {
	    visible : false,
	    open: this.cfg.info_button,
	    close: this.cfg.info_button,
	    onOpen : function(content,meshname){
		while(content.lastChild){
		    content.removeChild(content.lastChild);
		};
		console.log(meshname);
		self.sidebar.menuObj.AddSubItem(content,'Color',self.ColorParams(meshname));

	    },
	    title : 'Show/Hide Information',
	    userData : meshname
	},
	userButton : {
	    visible : true,
	    onCreate : function(image){
		image.src = self.cfg.user_button_visible;
	    },
	    onClick : function(image,modelName){
		var obj = self.viewer.scene.getObjectByName(self.viewer.meshes[meshname].name);
		var visible = self.viewer.meshes[meshname].visible
		image.src = visible ? self.cfg.user_button_hide : self.cfg.user_button_visible;
		obj.visible = !visible;
		self.viewer.meshes[meshname].visible = !visible;
	    },
	    title : "Show/Hide map",
	    userData : meshname
	}
    };

    this.sidebar.addSubItem('mesh-group',meshname,params);     
}


ImporterApp.prototype.ColorParams = function(meshname)
{
    var self = this;
    
    return {
	openCloseButton:{
	    open : this.cfg.open_button,
	    close : this.cfg.close_button,
	    title : 'Map color',
	    onOpen : function(content,modelName){
		while(content.lastChild){
		    content.removeChild(content.lastChild);
		};		
		colorInput = document.createElement('input');
		colorInput.className = 'colorSelector';
		colorInput.setAttribute('type','text');
		var obj = self.viewer.scene.getObjectByName(self.viewer.meshes[meshname].name);
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
			var obj = self.viewer.scene.getObjectByName(self.viewer.meshes[meshname].name);
			var rgb = color.toRgb();
			obj.material.color.r = rgb.r/255.;
			obj.material.color.g = rgb.g/255.;
			obj.material.color.b = rgb.b/255.;

		    }
		});
	    },
	    userdata : meshname
	}
    }

}

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
    oReq.open("GET",this.cfg.cell_selector);
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
	
	this.topbar.dialog.Resize ();
};





