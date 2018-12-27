ImporterApp = function (_synapse)
{
    this.synapse = _synapse;
};


ImporterApp.prototype.Init = function()
{
    var self = this;
    console.log(self.synapse);
    
    var herm = ['N2U','JSH','JSE'];
    var male = ['n930','n2y']

    var pnav = document.getElementById('main-nav');
    var pnava = document.createElement('button');
    pnava.onclick = function(){
	window.history.back();
    };
    pnava.innerHTML = 'Back'
    pnav.appendChild(pnava);

    var url = '../php/getSynapse.php?contin='+self.synapse.continNum+'&db='+self.synapse.db;
    var xhttp = new XMLHttpRequest();    
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    var data = JSON.parse(this.responseText);
	    document.getElementById('database').innerHTML = self.synapse.db;
	    document.getElementById('cell').innerHTML = self.synapse.neuron;
	    document.getElementById('contin').innerHTML = self.synapse.continNum;
	    document.getElementById('source').innerHTML = data.pre;
	    document.getElementById('target').innerHTML = data.post;
	    document.getElementById('sections').innerHTML = data.sections;
	    
	    var selector = document.getElementById('section');
	    selector.onchange = function(){
		var objNum = this.value;
		var zoom = document.getElementById('zoomForm').elements['zoomMode'].value;
		self.LoadImage(zoom,objNum);
	    };
	    for (var objNum in data.image){
		var opt = document.createElement('option')
		opt.value = objNum;
		opt.innerHTML = data.image[objNum].series + ': ' + 
		    data.image[objNum].imgNum + ',  ObjectID: ' + objNum;
		selector.appendChild(opt);
	    };
	    var _objNum = Object.keys(data.image)[0]
	    var zoom = document.getElementById('zoomForm').elements['zoomMode'].value;
	    self.LoadImage(zoom,_objNum);
	    //var imgUrl = '../php/loadReducedEM
	}
    };
    xhttp.open("GET",url,true);
    xhttp.send();
    
    var zoomform = document.getElementById('zoomForm');
    zoomform.onchange = function(){
	var selector = document.getElementById('section');
	var objNum = selector.value;
	var zoom = this.elements["zoomMode"].value;
	self.LoadImage(zoom,objNum);
    };

};


ImporterApp.prototype.LoadImage = function(_zoom,_objNum)
{
    var self = this;
    var objNum = _objNum;
    var url = '../php/loadSynapseImage.php?contin='+this.synapse.continNum+
	'&db='+self.synapse.db+'&objNum='+objNum+'&zoom='+_zoom;

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

