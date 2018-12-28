
window.onload = function(){
    new ImporterWW("banner","wwnavbar");
    var p = document.createElement('h3');
    p.innerHTML = "News and updates:";
    menu.appendChild(p);
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load",function(){
	var list = this.responseText.split('\n');
	ImporterList(menu,{id:"news",
			   elements: list});
    });

    var newsFile = './configs/news.txt';
    oReq.open("GET",newsFile)
    oReq.send();
};
