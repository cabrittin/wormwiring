ImporterApp = function (_synapses)
{
    this.synapses = _synapses;
};


ImporterApp.prototype.Init = function()
{
    var self = this;
    
    var url = '../partnerList/?continName='+self.synapses.continName +
	'&series='+self.synapses.series; 
    var pnav = document.getElementById('main-nav');
    var pnava = document.createElement('a');
    pnava.href = url;
    pnava.innerHTML = 'Synaptic Partner list'
    pnav.appendChild(pnava);
    
    var cell = document.getElementById('cell-name');
    cell.innerHTML = 'Cell Name: ' + self.synapses.continName;

    var url = '../php/getSynapseList.php/?continName='+
	self.synapses.continName+'&series='+self.synapses.series;
    var xhttp = new XMLHttpRequest();    
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    var data = JSON.parse(this.responseText);
	    var ptype = ['elec','pre','post'];
	    for (let p of ptype){
		var tbl = document.getElementById(p);
		//visible list element
		for (var i in data[p].list){
		    var tbody1 = document.createElement('tbody');
		    //tbody.className = 'labels';
		    var tr = document.createElement('tr');
		    tr.className = 'labels';
		    for (var j  in data[p].list[i]){
			var td = document.createElement('td');
			if (j == 0){
			    td.colSpan = 4;
			    td.class = 'rcol';
			    var label = document.createElement('label');
			    label.setAttribute('for',data[p].list[i][j]);
			    label.innerHTML = data[p].list[i][j];
			    var input = document.createElement('input');
			    input.name = data[p].list[i][j];
			    input.type = 'checkbox';
			    input.id = data[p].list[i][j];
			    input.setAttribute('data-toggle','toggle');
			    input.onclick = function(){
				$(this).parents().next('.hide').toggle();
			    };
			    td.appendChild(label);
			    td.appendChild(input);
			} else {
			    td.colsSpan = 1;
			    td.class = 'lcol';
			    td.innerHTML = data[p].list[i][j];
			};
			tr.appendChild(td);
		    };
		    tbody1.appendChild(tr)
		    tbl.appendChild(tbody1);
		    
		    //hidden list element
		    var tbody2 = document.createElement('tbody');
		    tbody2.className = 'hide';
		    tbody2.setAttribute('style','display:none;');
		    for (var j in data[p].synList[i]){
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.className = 'rcol'
			tr.appendChild(td);
			var td = document.createElement('td');
			td.className = 'lcol'
			td.innerHTML = data[p].synList[i][j][1];
			tr.appendChild(td);
			var td = document.createElement('td');
			td.className = 'lcol'
			//td.innerHTML = data[p].synList[i][j][3];
			var a = document.createElement('a');
			var href = '../synapseViewer/?neuron=' + 
			    self.synapses.continName + '&db=' + 
			    data[p].synList[i][j][1] + '&continNum=' +
			    data[p].synList[i][j][3] + '&series=' +
			    self.synapses.series;
			a.href = href;
			a.innerHTML = data[p].synList[i][j][3];
			td.appendChild(a);
			tr.appendChild(td);			
			var td = document.createElement('td');
			td.className = 'lcol'
			td.innerHTML = data[p].synList[i][j][4];
			tr.appendChild(td);			
			var td = document.createElement('td');
			td.className = 'lcol'
			tr.appendChild(td);
			var td = document.createElement('td');
			td.className = 'lcol'
			td.innerHTML = data[p].synList[i][j][2];
			tr.appendChild(td);
			tbody2.appendChild(tr)
			tbl.appendChild(tbody2);
		    };
		};
		
		
	    };
	};
    };
    xhttp.open("GET",url,true);
    xhttp.send();
     
    
   
};
