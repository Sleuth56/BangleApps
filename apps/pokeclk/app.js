Modules.addCached("Font4x5",function(){exports.add=function(a){a.prototype.setFont4x5=function(){this.setFontCustom(atob("AAAAdBgGAfV8CfyBIiQKrcAMAA6IARcAFXVARxAAwABCEAAIAAGTAPx+BHwAvXoK1+DhPg7W4P1uCEPg/X4O1+ACgACoAIqIBSlAIqIIVQC9VAfR4P1UB0VA/FwP1qD9KAdGYPk+AHwAEHwPk2D4Qg+j4PweB0XA/RAHTeD9FgTWQIfgD4fg8HwPi+DZNgwfAJ1yD8QAwQYI/ABEEACEIIIAB9Hg/VQHRUD8XA/WoP0oB0Zg+T4AfAAQfA+TYPhCD6Pg/B4HRcD9EAdN4P0WBNZAh+APh+DwfA+L4Nk2DB8AnXICfiAGwAj8gIYQAA=="),32,4,5)}}});

const width = g.getWidth();
const height = g.getHeight();

var drawTimeout;

var img = {
  width : 176, height : 149, bpp : 4,
  transparent : -1,
  palette : new Uint16Array([25804,806,0,21514]),
  buffer : require("heatshrink").decompress((atob("iIA/AH4A/AH4AGgAA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4ATgUiIP5IVK/5IVgMSkRX/K5MiiJXJiMSJ/5YJiJX/K7BYHKwJjKAH5MKK/5YWBAZX/K65M/LB4AHJf5XWJX5X/K98RiBM/K/5WtK/5XQgEiKokCkBN/K/5XmkRXEiUiK/5WOK5EjJf75BBZJUBKoshAYRX/K/77aiMQBYYHCK4kSAoRYBK/5X/K9IAFK/5XXiJX/K45QIK35XcK3pXHLASu/LipXPKX5X/AChHKK54A/AH4AUXKgaPAHhXQiBN/AH4A/AH4A/AAY")))
};

var night= {
  width : 89, height : 76, bpp : 4,
  transparent : 2,
  buffer : (atob("ERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERABEREREREREAEREREREREREREREREREREREREREREREREREREREREREREREQABERERERHwABEREREREREREREREREREREREREREREREREREREREREREREREQ/xERERER/wERERERERERERERERERERERERERERERERERERERERERERERERH//xERERH//xERERERERERERERERERERERERERERERERERERERERERERERERH//xEREf/xERERERERERERERERERERERERERERERERERERERERERERERERERH///////ERERERERERERERERERERERERERERERERERERERERERERERERERER////////8RERERERERERERERERERERERERERERERERERERERERERERERERH/////////ERERERERERERERERERERERERERERERERERERERERERERERERER////D///DxERERERERERERERERERERERERERERERERERERERERERERERERH////w///w8RERERERERERERERERERERERERERERERERERERERER//ERERER//AA///w/w8REREREREREREREREREREREREREREREREREREREREf////EREf/wAP/wAA8PERERERERERERERERERERERERERERERERERERERERH////xERH/8AD/////DxERERERERERERERERERERERERERERERERERERERER////8REf//////////ERERERERERERERERERERERERERERERERERERERERERERH/8R/////////xERERERERERERERERERERERERERERERERERERERER////////Ef////////////////////////////////////////////////////////////////////////////////////////////////////////////8RERERH////////////xERERERERERERERERERERERERERERERERERERERERERERERH///////////EREREREREREREREREREREREREREREREREREREREREf/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w=="))
};

function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function isDark(){
   if (g.theme.dark==true){
    g.setColor(0xFFFF);
  }
  else {
    g.setColor(0x0000);
  }
}

function time() {
  var d = new Date();
  var day = d.getDate();
  var time = require("locale").time(d,1);
  var mo = require("date_utils").month(d.getMonth()+1,1);
  
  require("Font4x5").add(Graphics); // time
  isDark();
  g.setFontAlign(0,0);
  g.setFont("4x5",7.5).drawString(time, width/2, height/2);  

  g.setFontAlign(1,1);
  g.setFont("4x5",3).drawString(mo+" "+day, width-15, height-35);  
}

function draw() { //poketch background  
  if (g.theme.dark==true){
    g.drawImage(night, 0, 25, {scale:2}); //poketch is life  
  }
  else {
    g.drawImage(img, 0, 25); //poketch is life  
  }  
  time();
  queueDraw();
}

//program start
g.clear();
draw();

// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
