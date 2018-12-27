var BANNER_IMG = "http://localhost/art1/oldheadercolor.jpg";
var HOME = 'http://localhost/';
var WIRING_PROJECTS = {
    "About Series":"http://localhost/pages/about.html",
    "Male":"http://localhost/sex/male.php",
    "Hermaphrodite":"http://localhost/sex/hermaphrodite.php"
};
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
    menu.AddDropDown(NAVBAR_CLASSES,"wiring",'Wiring Projects',WIRING_PROJECTS);
    menu.AddLink('Contact',CONTACT);
};




