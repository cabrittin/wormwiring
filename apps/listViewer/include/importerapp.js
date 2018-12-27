ImporterApp = function (params)
{
    this.validCells = [];
    this.GetCellDisplay();

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
    this.menuGroup = {};
    this.selectedNeurons = {};

    this.url = '../partnerList/'
    var text = "Select sex, then data series and then choose the cell in Select Neuron to display synaptic partners";
    var video = 'https://youtube.com/embed/u5X7I1CBtoo';
    if ('listtype' in params & params.listtype != null){
	if (params.listtype == 'synapse'){
	    this.url = '../synapseList/';
	    text = "Select cell to display synapses. Click on the target cell to show " +
		"the individual synapses. Click on synapse id to view synapse in the electron micrograph.";
	    video = "https://youtube.com/embed/MqWBlRG0Tjc";
	};
    };
    
    var iframe = document.getElementById('frame-viewer');
    iframe.src = this.url;


    this.helpParams =  [
	{
	    title : 'Quick start',
	    text :  text,
	    video: video, 
	    name : 'help-display'
	}
    ];

};




ImporterApp.prototype.Init = function ()
{
    var self = this;
    var top = document.getElementById ('top');
    var importerButtons = new ImporterButtons (top);
    importerButtons.AddLogo('Help',function(){self.HelpDialog();});
    importerButtons.AddLogo ('Select neuron', function () { self.NeuronSelectorDialog (); });
    //importerButtons.AddLogo ('Clear maps', function () {self.ClearMaps();});

    
	
    this.dialog = new FloatingDialog ();
    
    this.GenerateMenu();

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
		    var sexSelect = document.getElementById('sex-selector').value;
		    var seriesSelect = document.getElementById('series-selector').value;
		    //var series = sexSelect;
		    //if (seriesSelect == 'N2W'){
			//series = 'pharynx';
		    //};	
		    for (var group in self.selectedNeurons){
			for (var i in self.selectedNeurons[group]){
			    if (self.selectedNeurons[group][i].visible == 1){
				console.log('Series: ' + seriesSelect);
				var sex = document.getElementById('sex-selector').value;
				var iframe = document.getElementById('frame-viewer');
				iframe.src = self.url + "?continName=" + i +
				    "&series="+seriesSelect;
				self.selectedNeurons[group][i].visible = 0;
			    };
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

  
    var menu = document.getElementById('menu');
    this.menuObj = new ImporterMenu(menu);
    
    this.menuGroup['series-selector'] =
	AddDefaultGroup(this.menuObj,'Series selector',visible=true);

    //Series selector
    AddSexSelector(this.menuObj,this.menuGroup['series-selector'],'Sex');
    AddSeriesSelector(this.menuObj,this.menuGroup['series-selector'],'Series');
    
    this.SetCellSelector();
};
