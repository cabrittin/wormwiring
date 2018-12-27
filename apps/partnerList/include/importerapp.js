ImporterApp = function (_partners)
{
    this.partners = _partners;
    
    console.log(this.partners);
};


ImporterApp.prototype.Init = function()
{
    var self = this;
    
    var url = '../synapseList/?continName='+self.partners.continName +
	'&series='+self.partners.series; 
    var pnav = document.getElementById('main-nav');
    var pnava = document.createElement('a');
    pnava.href = url;
    pnava.innerHTML = 'Synapse list'
    pnav.appendChild(pnava);

    var cell = document.getElementById('cell-name');
    cell.innerHTML = 'Cell Name: ' + self.partners.continName;

    var url = '../php/getPartnerList.php/?continName='+
	self.partners.continName+'&series='+self.partners.series;
    var xhttp = new XMLHttpRequest();    
    xhttp.onreadystatechange = function(){
	if (this.readyState == 4 && this.status == 200){
	    var data = JSON.parse(this.responseText);
	    var headers = ['header1','header2','header3'];
	    for (var i=0; i<3; i++){
		var _header = document.getElementsByClassName(headers[i]);
		for (var j= 0; j<_header.length; j++){
		    _header[j].innerHTML = data.headers[i];
		};
	    };
	    
	    var ptype = ['elec','pre','post']
	    for (let p of ptype){
		var tbl = document.getElementById(p);
		for (var i in data[p]){
		    var tr = document.createElement('tr');
		    for (var j=0; j<data[p][i].length;j++){
			var td = document.createElement('td');
			if ( j == 0){
			    td.colSpan = 3;
			    td.class = 'rcol';
			} else {
			    td.colSpan = 1;
			    td.class = 'lcol';
			};
			td.innerHTML = data[p][i][j];
			tr.appendChild(td)
		    };
		    tbl.appendChild(tr);
		};
		
	    };
	}
    };
    xhttp.open("GET",url,true);
    xhttp.send();
     
    
   
};
