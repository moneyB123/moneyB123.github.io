///////////////////////////////////////////////////////////////////////////////////////////////////
// INITIALIZE VARIABLES

var currentSection = null;
var openMenu = new Array();
var pageWidth = screen.width;
if (pageWidth < 480) pageWidth = 480;
var menuText = parent.document.URL.indexOf("lang=ES") == -1 ? "Menu" : "Menú";
var closeText = menuText == "Menu" ? "Close" : "Cerrar";

//////////////////////////////////////////////////////////////////////////////////////////////////////
// ANIMATION FUNCTIONS

function setLeft(section, value) {
	if (cssTrans) {
		section.style.left = value + "px";
	} else {
		currentSection = section;
		value == 0 ? slide(pageWidth, -1) : slide(0, 1);
	}
}

function setHeight(section, fromValue, toValue) {
	if (cssTrans) {
		section.style.height = toValue + "px";
	} else {
		currentSection = section;
		toValue == 0 ? drawer(fromValue, 0, -1) : drawer(0, toValue, 1);
	}
}

function slide(currentValue, direction) {
	currentValue = currentValue + (direction * 60);
	if (currentValue < 0) {
		currentSection.style.left = "0px";
		currentSection = null;
	} else if (currentValue >= pageWidth) {
		currentSection.style.left = pageWidth + "px";
		currentSection = null;
	} else {
		currentSection.style.left =  currentValue + "px";
		setTimeout('slide(' + currentValue + ', ' + direction + ')', 1);
	}
}

function drawer(currentValue, maxValue, direction) {
	currentValue = parseInt(currentValue, 10); 
	if(isNaN(currentValue)) { 
		currentValue = 0; 
	} 
	currentValue = currentValue + (direction * 50);
	if(currentValue < 0) {
		currentSection.style.height = "0px";
		currentSection = null;
	} else if(currentValue >= maxValue && direction == 1) {
		currentSection.style.height = maxValue + "px";
		currentSection = null;
	} else {
		currentSection.style.height =  currentValue + "px";
		setTimeout('drawer(' + currentValue + ', ' + maxValue + ', ' + direction + ')', 1);
	}
}


// MENU FUNCTIONS

function toggleMenu() {
	if (!currentSection) {
		var menuButton = document.getElementById('mobmenuButton');
		var menu = document.getElementById('mobmenu');
		var max_height = menu.getAttribute("max_height");
		var cover = document.getElementById('cover');
		if (!max_height) {
			menu.style.display = "block";
			max_height = menu.offsetHeight
			menu.setAttribute("max_height", max_height);
			var menuTop = menuButton.parentNode.offsetTop + menuButton.parentNode.offsetHeight;// + 9;
			menu.style.top = menuTop + "px";
		}

		if (menu.style.height == "" || menu.style.height == "0px") {
			setHeight(menu, 0, max_height);
			menuButton.innerHTML = closeText;
			if (!cover.style.height) {
				cover.style.height = (document.getElementById('menuwrapper').offsetHeight - menuTop) + "px";
				cover.style.top = menuTop + "px";
			}
			cover.style.left = "0px";
			cover.style.width = "100%";
			cover.style.opacity = "0.4";
		} else {	
			resetMenu();
			setHeight(menu, max_height, 0);
		}
	}
}

function closeMenu() {
	if( document.getElementById('mobmenu') ){
		document.getElementById('mobmenu').style.height = "0px";
		resetMenu();
	}
}

function resetMenu() {
	for (i=0; i<openMenu.length; i++) {
		openMenu[i].style.display = "none";
		openMenu[i].style.left = "100%";
	}
	document.getElementById('mobmenuButton').innerHTML = menuText;
	document.getElementById('cover').style.width = "0px";		
	document.getElementById('cover').style.opacity = "0";
	for (i=0; i<openMenu.length; i++) {
		openMenu[i].style.display = "block";
	}
	openMenu = new Array();
}

function goTo(obj) {
    if (!currentSection) {
        var section = obj.nextSibling;
        while(section && section.nodeType === 3) {
            section = section.nextSibling;
        }
        if (section) {
            openMenu[openMenu.length] = section;
            document.getElementById('mobmenu').style.height = section.offsetHeight + "px";
            setLeft(section, 0);
        } else {
            closeMenu();
            location = obj;
        }
    }
}

function goBack(obj) {
	if (!currentSection) {
		document.getElementById('mobmenu').style.height = document.getElementById('mobmenu').getAttribute("max_height") + "px";
		setLeft(obj.parentNode, pageWidth);
	}
}