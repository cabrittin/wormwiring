var HOME = window.location.protocol + "//" + window.location.host 
var BANNER_IMG = HOME + "/ww/site/images/oldheadercolor.jpg";
var WIRING_PROJECTS = HOME + "/series/"
var APPS = {
    "Skeleton maps": HOME + "/apps/neuronMaps",
    "Volumetric viewer": HOME + "/apps/neuronVolume"
};

var CODE = {
    "Elegance":"https://github.com/Emmonslab/Elegance"
}

var CONTACT = HOME + "/pages/contact.htm"

var NAVBAR_CLASSES = {
    div: "dropdown",
    button: "dropbtn",
    content: "dropdown-content"
}

ImporterWW = function(_banner,_navbar)
{
    new ImporterBanner(_banner,BANNER_IMG);
    var navbar = document.getElementsByClassName(_navbar)[0];
    var menu = new ImporterNavBar(navbar);
    menu.AddLink('Home',HOME);
    menu.AddLink('Wiring Projects',WIRING_PROJECTS)
    menu.AddDropDown(NAVBAR_CLASSES,"apps",'Apps',APPS);
    menu.AddDropDown(NAVBAR_CLASSES,"code","Code",CODE)
    menu.AddLink('Contact',CONTACT);
};


