var skinTextures = [["standart", true, 0, 1, function(a) {return a}, "Normal pers\nlifes: 1", 0], 
["afro", false, 20, 1, function(a) {return a}, "Normal pers\nlifes: 1", 0], 
["vaider", false, 70, 1, function(a) {return a+1}, "lifes: 1\nBonus: +1", 0], 
["milonov", false, 148, 3, function(a) {return a+((a/100)*20)}, "lifes: 3\nBonus: 20%\n+1 score", 2], 
["kadirov", false, 282, Infinity, function(a) {return a+((a/100)*20)}, "lifes: Infinity\nBonus: 20%\n+5 score", 10],
["putin", false, 3190, 1, function(a) {return a**2}, "lifes: 1\nBonus: bonus^2\n+20 score", 40],
["hesus", false, 14800, Infinity, function(a) {return a**2}, "lifes: Infinity\nBonus: bonus^2\n+50 score", 100]];

var cvs = document.getElementById("canvas");//инициализация canvas
var ctx = cvs.getContext("2d");

var menuOld = 0;//старое меню
var debug = false;//ну, тут понятно
var timer = 0;//переменная таймера

var dr_audio = new Audio('dr.mp3');//звук
var cl_dr_audio = dr_audio.cloneNode();//клон звука
var audiOn = true;//Включен ли звук
var per = [];//массив с кадрами анимации персонажа
var door = [];//с кадрами анимации двери

var card, liba, doors, score, game, menu;//инициализация игровых переменных
var lvl = 1;

var modeStatisticsMenu = 2;//переменные состояния меню
var listStatisticsMenu = 0;
var men = "";
var textColor = "rgba(200, 220, 1, 0.9)";//настройки стиля
var background = "#076685";
var backgroundBut = "rgba(0,0,0,0.5)";

var skinNow = 0;//текущий скин

var buttons = [ //настройка кнопок в сцене надпись, координаты по х, к-ты по у, ширина, высота, функция при нажатии
[["", 20, 15, 60, 10, function() {	if(skinTextures[listSkinMenu[2]*3][0] != "") initimg(skinTextures[listSkinMenu[2]*3][0])}],//0
["", 20, 35, 60, 10, function() {if(skinTextures[listSkinMenu[2]*3+1][0] != "" && skinTextures[listSkinMenu[2]*3+1][0] != undefined) initimg(skinTextures[listSkinMenu[2]*3+1][0])}],
["", 20, 55, 60, 10, function() {if(skinTextures[listSkinMenu[2]*3+2][0] != "" && skinTextures[listSkinMenu[2]*3+1][0] != undefined) initimg(skinTextures[listSkinMenu[2]*3+2][0])}],
[">", 60, 75, 20, 10, function() {if(listSkinMenu[2]+1 <= listSkinMenu[1]) listSkinMenu[2]++;}], 
["<", 20, 75, 20, 10, function() {if(listSkinMenu[2]-1 >= 0) listSkinMenu[2]--;}]], 

[["Start", 20, 10, 60, 10, function() {start();menu = 2;}], //1
["Survival Mode", 20, 25, 60, 10, function() {start();menu = 3 ;}], 
["+", 60, 45, 20, 10, function() {if(lvl < 20) lvl++}], 
["-", 20, 45, 20, 10, function() {if(lvl > 1 ) lvl--}],
["Choice Of Skin", 20, 60, 60, 10, function() {listStatisticsMenu = parseInt(localStorage.getItem("skinPack")); menu = 9;}],
["Info", 20, 75, 60, 10, function() {menu = 6}]],

[], [], //2, 3

[["To Main Menu", 20, 55, 60, 10, function() {saveStat();start();menu = 1;}],//4
["Restart", 20, 75, 60, 10, function() {saveStat();start();menu = menuOld;}]],

[["To Main Menu", 20, 55, 60, 10, function() {start();menu = 1;}],//5
["Return", 20, 75, 60, 10, function() {menu = menuOld; game = 1}]],

[["To Main Menu", 20, 75, 60, 10, function() {start();menu = 1;}],
["About", 20, 60, 60, 10, function() {menu = 7}],
["Records", 20, 45, 60, 10, function() {listStatisticsMenu = 0;menu = 8}],
["Clear All Data", 20, 30, 60, 10, function() {localStorage.clear();location.reload();}]],//6

[["Back", 20, 75, 60, 10, function() {menu = 6}]],//7

[[">", 65, 53, 15, 10, function() {if(modeStatisticsMenu == 2) {modeStatisticsMenu = 3} else {modeStatisticsMenu = 2}}], 
["<", 20, 53, 15, 10, function() {if(modeStatisticsMenu == 2) {modeStatisticsMenu = 3} else {modeStatisticsMenu = 2}}],
[">", 65, 64, 15, 10, function() {listStatisticsMenu++; if(listStatisticsMenu > 3) listStatisticsMenu = 0;}], 
["<", 20, 64, 15, 10, function() {listStatisticsMenu--; if(listStatisticsMenu < 0) listStatisticsMenu = 3;}],
["Back", 20, 75, 60, 10, function() {menu = 6}]],

[["Back", 20, 75, 60, 10, function() {menu = 1}],
[">", 65, 64, 15, 10, function() {listStatisticsMenu++; if(listStatisticsMenu > skinTextures.length-1) listStatisticsMenu = 0;}], 
["<", 20, 64, 15, 10, function() {listStatisticsMenu--; if(listStatisticsMenu < 0) listStatisticsMenu = skinTextures.length-1;}],
["", 50, 53, 45, 10, function(){
	if(skinTextures[listStatisticsMenu][1]){
		initimg(listStatisticsMenu);
		save();
	} else {
		if(skinTextures[listStatisticsMenu][2] <= drochCoin) {
			skinTextures[listStatisticsMenu][1] = true;
			drochCoin -= skinTextures[listStatisticsMenu][2];
			save();
		}
	}
}]]//9
];

if(localStorage.getItem("records") == null) {//загрузка
	var ddd = "";
	for(i = 0; i < 20; i++) {
		ddd += "2," + String(i+1) + ",0;3," + String(i+1) + ",0;"
	}
	localStorage.setItem("records", ddd);
	delete ddd;
}

var x = localStorage.getItem("records").split(";");
var records = [];
for(i = 0; i < x.length-1; i++) {
	records.push(x[i].split(","))
}
delete x;

if(localStorage.getItem("skinPack") == null) {
	initimg(0);
	menu = 9;
} else {
	initimg(localStorage.getItem("skinPack"));
	menu = 1;
}

if(localStorage.getItem("statTime") == null) {
	var statTime = 0;
	localStorage.setItem("statTime", statTime);
} else {
	var statTime = parseInt(localStorage.getItem("statTime"));
}

if(localStorage.getItem("statTap") == null) {
	var statTap = 0;
	localStorage.setItem("statTap", statTap);
} else {
	var statTap = parseInt(localStorage.getItem("statTap")); 
}

if(localStorage.getItem("drochCoin") == null) {
	localStorage.setItem("drochCoin", 0);
	drochCoin = 0;
} else {
	drochCoin = parseInt(localStorage.getItem("drochCoin"));
}

if(localStorage.getItem("openSkins") == null) {
	var sds = "";
	for(i = 0; i < skinTextures.length; i++) {
		if(skinTextures[i][1]) {
			sds += "1";
		} else {
			sds += "0";
		}
		if(i != skinTextures-2) sds += ";";
	}
	localStorage.setItem("openSkins", sds);
	delete sds;
} else {
	var sds = localStorage.getItem("openSkins");
	sds = sds.split(";")
	for(i = 0; i < skinTextures.length; i++) {
		if(sds[i] == "1") skinTextures[i][1] = true;
	}
}



function initimg(skinNum) {//инициализация скинов
	skinNow = skinNum;
	localStorage.setItem("skinPack", skinNum);
	var skinName = skinTextures[skinNum][0];
	for (i = 0; i < 4; i++) {
		per[i] = new Image();
		per[i].src = skinName + String(i) + ".png";
	}
	for (i = 0; i < 4; i++) {
		door[i] = new Image();
		door[i].src = skinName + "m" + String(i) + ".png";
	}
	menu = 1;
}

function firstCard(skinNum) {//загрузка первого скина
	var hdhd = new Image();
	hdhd.src = skinTextures[skinNum][0] + "0" + ".png";
	return hdhd
}

var sm = 0;

function wper(wper_pers) {//получение ширины по процентам
		return parseInt((cvs.width/100) * wper_pers);
}

function hper(hper_pers) {//высоты по процентам
		return parseInt((cvs.height/100) * hper_pers);
}

function mamk(sort) {//изменение состояния двери
	if(sort == 1 && doors <= 2){ 
		doors += 1;
	} else if(sort == -1 && doors > 0) {
		doors += sort;
	}
	if(doors == 3) {
		doors = 2;
	}
	if(doors == 2) {
		doors = 3;
		setTimeout(function(){doors = 2;}, 500);
	}
}

function rand(min, max) {//получение случайного чила в диапазоне
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function start() {//сброс игры
	cadr = 0;
	liba = 4;
	doors = 0;
	score = 0;
	game = 1;
	timer = 0;
	nn = true;
	lifes = skinTextures[parseInt(localStorage.getItem("skinPack"))][3];
}


function formTime(times) {//форматирвоание времени из значения
	return String(parseInt(parseInt(times/10)/60)) + "m " + String(parseInt(times/10) - parseInt(parseInt((times/10)/60)*60)) + "s";
}

function save() {//сохраннение
	var azaz = "";
	
	for(i = 0; i < records.length; i++) {
		azaz += String(records[i][0]) + "," + String(records[i][1]) + "," + String(records[i][2]) + ";";
	}
	localStorage.setItem("records", azaz);
	localStorage.setItem("drochCoin", drochCoin);
	var sds = "";
	
	for(i = 0; i < skinTextures.length; i++) {
		if(skinTextures[i][1]) {
			sds += "1";
		} else {
			sds += "0";
		}
		if(i != skinTextures-2) sds += ";";
	}
	localStorage.setItem("openSkins", sds);
	delete sds;
	delete azaz;
}

function saveStat() {//сохранение статистики
	localStorage.setItem("statTime", statTime);
	localStorage.setItem("statTap", statTap);
}

function upRecord(mode, level, rcrd) {//проверка на новый рекорд
	var sds = false;
	
	for(i = 0; i < records.length; i++) {
		if(records[i][0] == mode && mode == 2 && records[i][1] == level) {
			if(parseInt(records[i][2]) > parseInt(rcrd) || parseInt(records[i][2]) == 0) {
				records[i][2] = rcrd;
				sds = true;
			}
		}
		if(records[i][0] == mode && mode == 3 && records[i][1] == level) {
			if(parseInt(records[i][2]) < parseInt(rcrd)) {
				records[i][2] = rcrd;
				sds = true;
			}
		}
}
	return sds;
}

function recold(mode, level) {//занос нового рекорда
	for(i = 0; i < records.length; i++) {
		if(records[i][0] == String(mode) && records[i][1] == String(level)) {
			return records[i][2];
		}
	}
}

function getTextWidth(text, font) {//получение ширины строки с текстоим в пикселях
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

function draw_lines() {//рисование линий
	ctx.fillStyle = "#ffffff";
	for(i = 0; i < 20; i++) {
		ctx.moveTo(0, hper(5*i));
		ctx.lineTo(wper(100), hper(5*i));
		ctx.stroke();
	}
	for(i = 0; i< 20; i++) {
		ctx.moveTo(wper(5*i), 0);
		ctx.lineTo(wper(5*i), hper(100));
		ctx.stroke();
	}
}

function draw_but(text, startx, starty, endx, endy) {//функция рисования кнопки
	ctx.fillStyle = backgroundBut;
	ctx.fillRect(wper(startx), hper(starty), wper(endx), hper(endy));//30 25 40 10
	ctx.fillStyle = textColor;
	if(text != "undefined") ctx.fillText(text, wper(startx) + (wper(endx)/2 - getTextWidth(text, ctx.font)/2), hper(starty) + (hper(6)));// 31 30 
}

function textInButton(text, startx, starty, endx, endy) {//рисование текста
	ctx.fillText(text, wper(startx) + (wper(endx)/2 - getTextWidth(text, ctx.font)/2), hper(starty) + (hper(6)));
}


function draw() {//основной цикл рисования
	ctx.fillStyle = background;
	ctx.fillRect(0, 0, wper(100), hper(100));	
	ctx.font = String(wper(5)) + "px Verdana";
	if(menu != 2 && menu != 3) {
		
		ctx.fillStyle = textColor;
		var str = "Droch Coins: " + String(drochCoin);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(5));
		
	}
	if(menu == 2){				
		var fontOld = ctx.font;
		ctx.font = String(wper(7)) + "px Verdana";
		draw_but("||", 0, 0, wper(4), wper(3));
		ctx.font = fontOld;
		delete fontOld;
		ctx.drawImage(per[cadr], wper(1), hper(20), hper(25), hper(50));
		ctx.drawImage(door[doors], wper(100)-hper(30), hper(12), hper(30), hper(30)); 
		ctx.fillStyle = backgroundBut;
		//ctx.fillText("Score: " + String(parseInt(score/2)), wper(100)/2 - getTextWidth("Score: " + String(score), ctx.font)/2, 30);
		ctx.fillRect(wper(29), hper(1), wper(42), hper(6));
		ctx.fillStyle = "white";
		ctx.fillRect(wper(30), hper(2), wper(40)*(score/200), hper(4));
	}
	if(menu == 1) {	
		ctx.font = String(wper(5)) + "px Verdana";
		ctx.fillStyle = textColor;
		for(i = 0; i < buttons[menu].length; i++) {
			draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
		}
		ctx.fillText("Level", wper(100)/2 - getTextWidth("Level", ctx.font)/2, hper(42));// 31 30 
		ctx.fillText(String(lvl), wper(100)/2 - getTextWidth(String(lvl), ctx.font)/2, hper(50));
	}
	if(menu == 3) {		
		var fontOld = ctx.font;
		ctx.font = String(wper(7)) + "px Verdana";
		draw_but("||", 0, 0, wper(4), wper(3));
		ctx.font = fontOld;
		delete fontOld;
		ctx.drawImage(per[cadr], wper(1), hper(20), hper(25), hper(50));
		ctx.drawImage(door[doors], wper(100)-hper(30), hper(12), hper(30), hper(30)); 
		/*ctx.drawImage(per[liba], (cvs.width/100) * 13.5, (cvs.height/100) * 24, (cvs.width/100) * 4, (cvs.height/100) * 2);*/
		ctx.fillStyle = textColor;
		//ctx.drawImage(door[doors], (cvs.width/100) * 70, (cvs.height/100) * 12, (cvs.width/100) * 30, (cvs.height/100) * 30); 
		ctx.fillStyle = backgroundBut;
		//ctx.fillText("Score: " + String(parseInt(score/2)), wper(100)/2 - getTextWidth("Score: " + String(score), ctx.font)/2, 30);
		ctx.fillRect(wper(29), hper(1), wper(42), hper(6));
		ctx.fillStyle = "white";
		ctx.fillRect(wper(30), hper(2), wper(40)*(score/200), hper(4));
	}
	if(menu == 0) {
		for(i = 0; i < buttons[menu].length; i++) {
			if(i >= buttons[menu].length - 2) { 
				draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
			} else {
				draw_but(String(skinTextures[listSkinMenu[2]*3 + i][0]), buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
			}	
		}
		ctx.fillText("textures pack", wper(100)/2 - getTextWidth("textures pack", ctx.font)/2, hper(10));
		ctx.fillText(String(listSkinMenu[2]+1) + "/" + String(listSkinMenu[1]+1), wper(100)/2 - getTextWidth(String(listSkinMenu[2]) + "/" + String(listSkinMenu[1]), ctx.font)/2, hper(80));
	}
	if(menu == 4) {
		ctx.fillStyle = textColor;
		var str = men[0];
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(10));
		var str = "Score: " + String(parseInt(score/2));
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(15));
		var str = "Time: " + formTime(timer);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(20));
		var str = "Level: " + String(lvl);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(25));
		if(menuOld == 2) {
			var str = "Record: " + formTime(recold(menuOld, lvl));
		} else { 
			var str = "Record: " + formTime(recold(menuOld, lvl));
		}
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(30));
		if(menuOld == 2) {
			var str = "Mode: Normal";
		} else {
			var str = "Mode: Survival";
		}
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(35));
		var str = "Bonus: " + String(men[1]);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(40));
		for(i = 0; i < buttons[menu].length; i++) {
			draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
		}
	}
	if(menu == 5) {
		ctx.fillStyle = textColor;
		var str = men[0];
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(10));
		var str = "Score: " + String(parseInt(score/2));
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(15));
		var str = "Time: " + formTime(timer);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(20));
		var str = "Level: " + String(lvl);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(25));
		if(menuOld == 2) {
			var str = "Record: " + formTime(recold(menuOld, lvl));
		} else { 
			var str = "Record: " + formTime(recold(menuOld, lvl));
		}
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(30));
		if(menuOld == 2) {
			var str = "Mode: Normal";
		} else {
			var str = "Mode: Survival";
		}
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(35));
		for(i = 0; i < buttons[menu].length; i++) {
			draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
		}
	}
	if(menu == 6) {
		ctx.fillStyle = textColor;
		var str = "Skin Pack: " + skinTextures[localStorage.getItem("skinPack")][0];
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(10));
		var str = "All tap: " + String(statTap);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(15));
		var str = "Time in game: " + formTime(statTime);
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(20));
		for(i = 0; i < buttons[menu].length; i++) {
			draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
		}
	}
	if(menu == 7) {
		ctx.fillStyle = textColor;
		var str = "About: koza_azaza"
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(10));
		var str = "VK: https://vk.com/koza_azaza";
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(15));
		var str = "Group In VK: https://vk.com/drochsim";
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(20));
		var str = "Telegram: @Koza_azaza";
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(25));
		var str = "Telegram Chanel:";
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(30));
		var str = "https://t.me/drochsimgame"
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(35));
		for(i = 0; i < buttons[menu].length; i++) {
			draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
		}
	}
	if(menu == 8) {
		ctx.fillStyle = textColor;
		var str = "level " + String(listStatisticsMenu * 5 + 0 + 1) + ": " + formTime(recold(modeStatisticsMenu, (listStatisticsMenu * 5 + 0 + 1)));
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(10));
		var str = "level " + String(listStatisticsMenu * 5 + 1 + 1) + ": " + formTime(recold(modeStatisticsMenu, (listStatisticsMenu * 5 + 1 + 1)));
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(20));
		var str = "level " + String(listStatisticsMenu * 5 + 2 + 1) + ": " + formTime(recold(modeStatisticsMenu, (listStatisticsMenu * 5 + 2 + 1)));
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(30));
		var str = "level " + String(listStatisticsMenu * 5 + 3 + 1) + ": " + formTime(recold(modeStatisticsMenu, (listStatisticsMenu * 5 + 3 + 1)));
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(40));
		var str = "level " + String(listStatisticsMenu * 5 + 4 + 1) + ": " + formTime(recold(modeStatisticsMenu, (listStatisticsMenu * 5 + 4 + 1)));
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(50));
		if(modeStatisticsMenu == 2) {
			var str = "Normal";
		} else {
			var str = "Survival";
		}
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(60));
		var str = "List " + String(listStatisticsMenu+1) + "/4";
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(70));
		
		for(i = 0; i < buttons[menu].length; i++) {
			draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
		}
	}
	if(menu == 9) { 
		ctx.fillStyle = textColor;
		ctx.drawImage(firstCard(listStatisticsMenu), wper(1), hper(10), wper(40), wper(80));
		var str = skinTextures[listStatisticsMenu][0];
		ctx.fillText(str, wper(100)/2 - getTextWidth(str, ctx.font)/2, hper(70));
		
		for(i = 0; i < buttons[menu].length; i++) {
			draw_but(buttons[menu][i][0], buttons[menu][i][1], buttons[menu][i][2], buttons[menu][i][3], buttons[menu][i][4]);
		}
		if(skinTextures[listStatisticsMenu][1]) {
			var str = "Use";
		} else {
			var str = "Buy: " + String(skinTextures[listStatisticsMenu][2]) + " DC";
		}
		textInButton(str, 50, 53, 45, 10);
		var str = skinTextures[listStatisticsMenu][5].split('\n');
		for(i = 0; i < str.length; i++) {
			textInButton(str[i], 50, 10+(i*5), 50, 10);
		}
	}
	ctx.fillStyle = textColor;
	ctx.font = String(wper(5)) + "px Verdana";
	ctx.fillText("Droch Simulator Alpha", wper(100)/2 - getTextWidth("Droch Simulator Alpha", ctx.font)/2,hper(95));
	if(debug) draw_lines();
	requestAnimationFrame(draw);
}

function butTest(x, y, sx, sy, lx, ly) {//проверка нажатия в область
		if((x > sx) && (x < sx + lx) && (y > sy) && (y < sy + ly)) {
			return true;
		} else {
			return false;
		}
}

function action(x, y) {//в случае нажатия...
	if(audiOn) {
		dr_audio.play();
		audiOn = false;
	} else {
		cl_dr_audio.play();
		audiOn = true;
	}
	statTap++;
	if(menu == 2){
		menuOld = menu;
		if(butTest(x, y, 0, 0, wper(14), hper(9))) {// 0, 0, wper(4), wper(3));
			men = ["Pause", 0];
			game = 0;
			menu = 5;
		}
		if(game == 1){
			if(doors != 2) {	
				if(cadr < 3) {
					cadr++;
				} else {
					cadr = 0;
				}
				score += parseInt(20/lvl) + skinTextures[skinNow][6];
				if(score < 100) {
					liba = 4;
				} else if(score >= 100 && score < 150) {
					liba = 5;
				} else if(score >= 150 && score < 200) {
					liba = 6;
				} else {
					var sds = 0;
					if(upRecord(menu, lvl, timer)) sds += 2;
					sds += lvl + 3 - menu;
					sds += parseInt(skinTextures[skinNow][4](sds));
					drochCoin += sds;
					statTime += timer;
					save();
					saveStat();
					men = ["WIN", String(sds)];
					delete sds;
					game = 0;
					menu = 4;
				}
				//dr_audio.play();
			} else {
				lifes -= 1;
				if(menu == 2 && lifes == 0) {
				game = 0;
				statTime += timer;
				saveStat();
				men = ["LOSE", 0];
				menuOld = menu;
				menu = 4;
				}
			}
		}
	} else if(menu == 3){ 
		menuOld = menu;
		if(butTest(x, y, 0, 0, wper(14), hper(9))){// 0, 0, wper(4), wper(3));
			men = ["Pause", 0];
			game = 0;
			menu = 5;
		}
		if(game == 1){
			if(doors != 2){	
				score -= parseInt(20/lvl) + skinTextures[skinNow][6];
				if(score < 100) {
					liba = 4;
				} else if(score >= 100 && score < 150) {
					liba = 5;
				} else if(score >= 150 && score < 200) {
					liba = 6;
				} else {					
					var sds = 0;
					if(upRecord(menu, lvl, timer)) sds += 2;
					sds += parseInt(timer/(31-lvl));
					drochCoin += sds;
					statTime += timer;
					save();
					men = ["GAME OVER", String(sds)];
					delete sds;
					game = 0;
					menu = 4;
					nn = false;
				}
				//dr_audio.play();
			} else {
				lifes -= 1;
				if(lifes == 0) {
					var sds = 0;
					if(upRecord(menu, lvl, timer)) sds += 2;
					sds += parseInt(timer/(31-lvl));
					drochCoin += sds;
					statTime += timer;
					save();
					men = ["GAME OVER", String(sds)];
					delete sds;
					game = 0;
					menu = 4;
					nn = false;
				}
			}
		}
		if(score < 0) {
			score = 0;
		}
	}else if(menu != 2 && menu != 3) {
		for(i = 0; i < buttons[menu].length; i++) {
			if(butTest(x, y, wper(buttons[menu][i][1]), hper(buttons[menu][i][2]), wper(buttons[menu][i][3]), hper(buttons[menu][i][4]))) {
					buttons[menu][i][5]();
					break;
			} else {
			}
		}
	}  
}
var hzz = 0;
var nn = true;

setInterval(function() {
	if(game == 1 && menu == 3){ 
		if(hzz == 4) {		
			if(cadr < 3){
				cadr++;
			} else {cadr = 0;}
			hzz = 0;
		} else {hzz++};
		if(doors == 2) {
			hzz = 2;
		}
		score += (rand(1, 50)/(20.1-lvl)) * timer/100;
		if(score > 200 && nn) {
			var sds = 0;
			//sds += parseInt(((skinTextures[skinNow][4](lvl) + lvl)/1000)*timer);
			if(upRecord(menu, lvl, timer)) sds += 2;
			sds += parseInt(timer/(31-lvl));
			drochCoin += sds;
			statTime += timer;
			save();
			men = ["GAME OVER", String(sds)];
			delete sds;
			game = 0;
			menu = 4;
			nn = false;
		}
	}
	if(game == 1 && menu == 2) {
		score = score - (score/(21-lvl))/10;
	}
	if(game == 1) timer++;
}, 100);//интервал таймера
setInterval(function() {if(menu == 2 || menu == 3) {mamk(parseInt(rand(-1, 2)));}}, rand(60, 10000)*lvl);//интервал изменения состояния двери

if(window.innerWidth < window.innerHeight) {
	cvs.width = window.innerWidth;//задание ширины
	cvs.height = window.innerHeight + 2;//задание высоты
} else {
	cvs.width = window.innerHeight*(10/16) ;
	cvs.height = window.innerHeight + 2;//задание высоты
	sm = (window.innerWidth - cvs.width)/2;
	cvs.style.paddingLeft = String(sm) + "px";	
}
document.getElementById('canvas').addEventListener('click', function(event){action(event.clientX - sm, event.clientY)}, false);
document.addEventListener('keydown', function(event) {action(wper(22), hper(77))}, false);

start();
draw();
