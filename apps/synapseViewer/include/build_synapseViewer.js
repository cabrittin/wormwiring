window.onload = function()
{
    var parameters = location.search.substring(1).split("&");
    
    var synapse = {}
    for (var tmp in parameters){
	var temp = parameters[tmp].split("=");
	synapse[temp[0]] = temp[1]
    };
    
    var importerApp = new ImporterApp(synapse);
    importerApp.Init();
}
