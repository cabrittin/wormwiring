var BANNER_IMG = "http://wormwiring.org/art1/oldheadercolor.jpg";
var HOME = 'http://wormwiring.org';
var WIRING_PROJECTS = "http://wormwiring.org/series/"
var APPS = {
    "Skeleton maps":"http://wormwiring.org/apps/neuronMaps ",
    "Volumetric viewer":"http://wormwiring.org/apps/neuronVolume"
};

var CODE = {
    "Elegance":"https://github.com/Emmonslab/Elegance"
}

var CONTACT = "http://wormwiring.org/pages/contact.htm";

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




