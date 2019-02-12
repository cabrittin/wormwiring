ImporterApp = function (args,configFile)
{
    this.args = args;
    this.configFile = configFile;
    this.data = null;
};


ImporterApp.prototype.Init = function()
{
    this.cfg = {}
    var self = this
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
            self.cfg = JSON.parse(this.responseText);
	    self.GetSynapseInfo(function(){self.SetupPage()});	    
	}
    };
    xmlhttp.open("GET", this.configFile, true);
    xmlhttp.send();    
};


ImporterApp.prototype.SetupPage = function()
{

    var self = this;
    var top = document.getElementById('top');
    topbar = new TopBar(top);
    topbar.addHelp(this.cfg.help);
    topbar.addButton('Synapse List',
		     function(){
			 var url = self.cfg.synapse_list + "?db="+
			     self.args.db +"&cell="+self.args.neuron;
			 window.location.href = url;
		     });
    topbar.addButton('Partners List',
		     function(){
			 var url = self.cfg.partner_list + "?db="+
			     self.args.db +"&cell="+self.args.neuron;
			 window.location.href = url;			 
		     });
    
    synInfo = {
	'id' : 'synapse-info',
	'title' : 'Synapse info',
	'info' : {
	    'db' : ['Database: ',this.args.db],
	    'cellname': ['Cell: ',this.args.neuron],
	    'synapseId':['Synapse ID: ',this.args.continNum],
	    'source' : ['Source: ',this.data.synapse.source],
	    'target' : ['Target: ', this.data.synapse.target],
	    'sections' : ['#EM sects.: ', this.data.synapse.sections]
	}
	}
    var side = document.getElementById('menu');
    sidebar = new SideBar(side);
    sidebar.addInfoPanel(synInfo);

    var emopts = [];
    for (var i in this.data.image){
	emopts.push({"value":this.data.image[i].synobject,
		     "text":this.data.image[i].imgname +
		     "(" + this.data.image[i].synobject + ")"});
    };
    emSelect = {
	'id' : 'em-selector',
	'title': 'Select EM',
	'label':'EM # (Obj #)',
	'options':emopts,
	'onChange':function(){
	    var obj = document.getElementById('em-selector').value;
	    var zoom = document.getElementById('zoomForm').elements['zoomMode'].value;
	    self.LoadImage(zoom,obj);
	}
	
    };

    sidebar.addDropDown(emSelect);

    zoom = {
	'id':'zoomForm',
	'title':'Zoom level',
	'name':'zoomMode',
	'options': [
	    {'value':'0','text':'Low','checked':true},
	    {'value':'1','text':'High','checked':false}
	],
	'onChange':function(){
	    var obj = document.getElementById('em-selector').value;
	    var zoom = document.getElementById('zoomForm').elements['zoomMode'].value;
	    self.LoadImage(zoom,obj);
	}
    }

    sidebar.addRadioSelect(zoom);

    this.LoadImage(0,emopts[0].value);
};


ImporterApp.prototype.GetSynapseInfo = function(_callback)
{
    var self = this;

    var xhttp = new XMLHttpRequest();
    var url = this.cfg.synapse_loader + '?contin=' +
	this.args.continNum +'&db='+ this.args.db;
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    self.data = JSON.parse(this.responseText);
	    _callback();
	};
    };

    xhttp.open("GET",url,true);
    xhttp.send();
   
}

ImporterApp.prototype.LoadImage = function(_zoom,_objNum)
{
    var self = this;
    var objNum = _objNum;
    var url = this.cfg.image_loader +'?contin='+this.args.continNum+
	'&db='+this.args.db+'&objNum='+objNum+'&zoom='+_zoom;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    var data = JSON.parse(this.responseText);
	    var img_src = "data:image/jpeg;base64,"+data;
	    var canvas = document.getElementById('canvas');
	    var img = document.createElement('img');
	    img.src = img_src;
	    while (canvas.firstChild){
		canvas.removeChild(canvas.firstChild);
	    };
	    canvas.appendChild(img);
	    console.log('Image loaded: ' + objNum);
	};
    };
    xhttp.open("GET",url,true);
    xhttp.send();
    
}
