var configFile = 'config.json'

window.onload = function ()
{
    params = wwapps.loadURLParameters();
    new ImporterWW("banner","wwnavbar");
    var importerApp = new ImporterApp (params,configFile);
    importerApp.Init ();
};
