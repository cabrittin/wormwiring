ImporterApp = function (args,configFile)
{
    this.args = args;
    this.configFile = configFile
};


ImporterApp.prototype.Init = function()
{
    this.cfg = {}
    var self = this
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


ImporterApp.prototype.SetupPage = function()
{
    var top = document.getElementById('top');
    topbar = new TopBar(top);
    topbar.addHelp(this.cfg.help);
    topbar.addButton('Custom button',function(){alert('You pressed a button')});

    var side = document.getElementById('menu');
    sidebar = new SideBar(side);
    sidebar.addSeriesSelector(this.cfg);
    
};

