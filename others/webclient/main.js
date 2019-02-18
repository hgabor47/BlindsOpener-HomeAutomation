/*jshint esversion: 6 */
/*Prelimutens HOME  
*/

var TParams = function(loc) {  
    this.o = new Object();
    if (loc.length>0){
      var start = loc.indexOf("?");
      if (start>=0){
        loc=loc.substring(start+1);
        var p=loc.split("&");
        for (let i = 0; i < p.length; i++) {
          const o = p[i];
          start = o.indexOf("=");
          var b1 = o.substring(0,start);
          var b2 = o.substring(start+1);
          if (b1!=""){
            this.o[b1]=UTF8.decode(unescape(b2));
          }
        }
      }
    }
  
    this.get=function(name){
      return this.o[name];
    }
  };
  
  //+ Jonas Raoni Soares Silva
  //@ http://jsfromhell.com/geral/utf-8 [v1.0]
  UTF8 = {
      encode: function(s){
          for(var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;
              s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]
          );
          return s.join("");
      },
      decode: function(s){
          for(var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
              ((a = s[i][c](0)) & 0x80) &&
              (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
              o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
          );
          return s.join("");
      }
  };
  
  
  var loc = new URL(document.location);
  var params = new TParams(loc.search);
  //var params = loc.searchParams;
  //var flowdbget = ppp.get("flowdb");     
  var flowdbget = params.get("flowdb");  
  var flowdbplayer = params.get("player");  //USERVIEW if exists
  var ViewModes = Object.freeze({"Developer":1, "User":2});
  var VIEWMODE=ViewModes.Developer;
  if (flowdbplayer!=null){
    VIEWMODE=ViewModes.User;
  }
  //var flowdbinit=null; //if exists please remove this line flowdbinit is a innercircle start flowdb if you want
  var temp="flowdbeditor_temp";        
  var AUTOINCTSTART=1;
  var g=null;
  var flowdbeditor=null;
  var isdown=false;
  var zooms=[1200,2400,3200];
  var zoomvalue=1;
  
  
  function PreHOME_onload(){
  }

  function oonload(){
    g = document.getElementsByName("table");
    flowdbeditor = document.getElementById("flowdbeditor");
    
    flowdbeditor.addEventListener("mousemove",move);
    flowdbeditor.addEventListener("mouseup",up);
  
    for (let i = 0; i < g.length; i++) {
      const obj = g[i];
      obj.setAttribute("transform","translate(100,100)");
      obj.addEventListener("mousedown",down);
    }
  
    var but=document.getElementById("flowdbload");
    but.activ=false; //TODO!!! for prevent to double load in same time
    if (flowdbget!=null){
      LoadString(flowdbget);
      but.activ=true;
    } else {  
      if (flowdbinit==null){
        Load(temp);
        but.activ=true;
      }
      else //compact
      {
        if ( !flowdbinit.startsWith("<flow" )) {
          //TODO load serverside file to flowdbinit
          document.getElementById("loadserverdefault").style.display="flex";
          LoadServerDefault(); //but.activ=true; in the function
        } else {
          LoadString(flowdbinit); 
          but.activ=true;     
        }
      }
    }
    document.body.addEventListener("paste", PastePanel);
    newsdialog();
    addModules(document.getElementById("modules"));
    SortTables();
  }
  
  function colourNameToHex(colour)
  {
      var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
      "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
      "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
      "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
      "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
      "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
      "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
      "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
      "honeydew":"#f0fff0","hotpink":"#ff69b4",
      "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
      "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
      "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
      "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
      "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
      "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
      "navajowhite":"#ffdead","navy":"#000080",
      "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
      "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
      "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
      "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
      "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
      "violet":"#ee82ee",
      "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
      "yellow":"#ffff00","yellowgreen":"#9acd32"};
  
      if (typeof colours[colour.toLowerCase()] != 'undefined')
          return colours[colour.toLowerCase()];
  
      return false;
  }
  
  function getEditDistance2(p,cmd)  //(part,cmd) ->  [dist,chars,newcmd,%param value]
  { var res=[0,0,0,0];                    // nevezd át a táblát%nevűre > 
                                    // 1. nevezd át a táblát,nevezd át a táblát almafa névre
    var a=p.trim().split(" ");
    var b=cmd.split(" ");
    var c=b.splice(a.length);
    if (b.length<a.length){
      return null;
    }
    res[0]=getEditDistance(a.join(" "), b.join(" "));
    res[1]=p.length;
    res[3]=c.splice(0,1)[0];
    res[2]=c.join(" "); 
    return res; 
  }
  
  function getSimilarity(a,b){  
    var d=getEditDistance(a,b);
    return d/Math.max(a.length,b.length);
  }
  
  function getEditDistance(a, b){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 
  
    var matrix = [];
  
    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }
  
    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                  Math.min(matrix[i][j-1] + 1, // insertion
                                           matrix[i-1][j] + 1)); // deletion
        }
      }
    }
  
    return matrix[b.length][a.length];
  }
  
  //#region SPEECH 
  
  function AIHelp(lang="en"){
    var b = document.getElementById("AIHelp");
    b.style.visibility="visible";
    var aiul = document.getElementById("aiul");
    aiul.innerHTML="";
    var t=document.createElement("table");  
    for(let i=0;i<commands.length;i++){ 
  
      for (let k = 0; k < commands[i][0].length; k++) {
        const title = commands[i][0][k];
        if (title.startsWith(lang)){
  
          t.innerHTML+="<tr><td class='AITitle'>"+title.substring(2,999)+"</td></tr>";
          break;
        }
      }
  
  
      
      var mod=0;
      var r=null;
      for (let j = 1; j < commands[i].length; j++) {
        var cmd = commands[i][j];      
        if (cmd.language==lang){
          if (mod%3==0){
            r=document.createElement("tr");                    
          }
          r.innerHTML+="<td class='AIText'>"+cmd.command.replace("4","3").replace("1","")+"</td>";
          if (mod++%3==2){
            t.appendChild(r);
            r=null ;
          }
        }
      }
      if (r!=null){
        t.appendChild(r);
      }
    }
    aiul.appendChild(t);  
  }
  
  
  var startedAI=false;
  function AI(){  
    //AIHelp();
    if (startedAI) return;
    startedAI=true;
  
    window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
      const recognition = new SpeechRecognition();
    //recognition.lang = 'en-US';
    recognition.lang = 'hu-HU';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
  
    recognition.addEventListener('result', e => {
          const speechTotext = Array.from(e.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');
              
              if (e.results[0].isFinal) {
          robot(speechTotext);
              }
      });
  
    recognition.addEventListener('end', recognition.start);
    recognition.start();
  }
  
  // groupid,voicecommand[,difference(0.1 =10%),HU or EN]
  class TCMD{
    constructor (vgrp,command,langcode="hu",maxdifference=null){
      this.group=vgrp;//groupid
      this.cmd=command;
      this.diff=maxdifference;
      this.lang=langcode;
      if (this.lang!=null)
        this.lang=this.lang.toLowerCase();
    }
    get grp(){ //0
      return this.group;
    }
    get command(){ //1
      return this.cmd;
    }
    get difference(){ //2
      return this.diff;
    }
    get language(){ //3
      return this.lang;
    }
  }
  
  var commandgroup=0; //commands[0]
  var commands = [
    [ ["enStandard commands samples","huStandard parancs példák"], 
    /*OK*/new TCMD(1,"create 4 tables","en"),new TCMD(1,"create 4 table","en"),new TCMD(1,"create a table","en"),new TCMD(1,"4 tables create","en"),new TCMD(1,"készíts 4 táblát"),new TCMD(1,"szeretnék 4 táblát"),new TCMD(1,"készíts 4 új táblát"),new TCMD(1,"kérek 4 új táblát"),new TCMD(1,"csinálj 4 új táblát"),new TCMD(1,"adj 4 új táblát"),
    new TCMD(2,"connect from % to %","en"),new TCMD(12,"kösd össze a%és%táblákat"),new TCMD(12,"kapcsold össze a%és%táblákat"),new TCMD(12,"kösd össze a%és a%táblákat"),new TCMD(12,"kapcsold össze a%és a%táblákat"),new TCMD(12,"kösd össze a% táblát a%táblával"),
    new TCMD(3,"sötétítés"),new TCMD(3,"blackout"),
    new TCMD(4,"napfény"),new TCMD(4,"sunshine"),
    ]
  ];
  var change = [[" igen "," yes "],[" nem "," no "],[" free "," 3 "],[" form "," 4 "],["cleared","create"],[" tree "," 3 "],[" hive ","5"],[" one ","1"],[" two ","2"],[" too ","2"],[" six ","6"],[" sex ","6"],
   ["84 bus","8 tables"],["timetables","10 tables"],["grade","create"],["portable","4 tables"],["turntables","10 tables"],["neighbour","table"],[" you ","new"],
   [" egy "," 1 "],["névtáblát","4 táblát"],[" két "," 2 "],[" kettő "," 2 "],[" négy "," 4 "],[" három "," 3 "],[" öt "," 5 "],[" hat "," 6 "],[" hét "," 7 "],[" nyolc "," 8 "],[" kilenc "," 9 "],[" tíz "," 10 "],
   ["logikai","boolean"],[" szám "," integer "],["stream","string"],["sztring","string"],["dátum","date"],["audi","id"],["díj","id"],["agy","adj"],
   ["piros","red"],["kék","blue"],["zöld","green"],["sárga","yellow"],["fekete","black"],["fehér","white"],["narancs","orange"],["szürke","gray"],["lila","purple"],["barna","brown"],["cián","cyan"],
   ];
  
  var TSPHistory = function(limit=20,timelimit=3000){ //pieces,ms
    this.limit=limit;
    this.timelimit=timelimit;
    this.verem=[];
    this.mode=null;  
    this.add=function (p,mode=null) {    
      this.verem.push(p);
      if (mode!=null) this.mode=mode;
      if (this.verem.length>this.limit){
        this.verem=this.verem.splice(1);
      }
      this.time=(new Date()).getTime();
    };
    this.last=function() {
      return this.verem[this.verem.length - 1 ];
    };
    this.ellapsed=function(){
      if ((this.time+timelimit)<(new Date()).getTime()) return true;   
      return false; 
    };
  };
  var SPHistory = new TSPHistory();
  
  
  var speechlevel=0;
  
  function SpeechToInputbox(command){
    if ((document.activeElement!=null)){
      if ((document.activeElement.nodeName=="INPUT") ||  ((document.activeElement.nodeName=="TEXTAREA"))){
        var s = document.activeElement.value;
        s=s.slice(0,document.activeElement.selectionStart)+command+s.slice(document.activeElement.selectionEnd,23452345245425);      
        document.activeElement.value = s;
        return;
      }
    }
  }
  
  function robot(command){
    //SpeechToInputbox(command);
    command=command.toLowerCase();
    for (let i = 0; i < change.length; i++) {
      const chg = change[i];
      command=command.replace(chg[0],chg[1]);
    }
    if (speechlevel!=0){
      //all text transfer
      processSpeech(-1,command,0,null);
    }
    var mini=-1;
    var minv=10;
    var minparams=[];
    for (let i = 1; i < commands[commandgroup].length; i++) {
      var minta=commands[commandgroup][i].command;//[1];
      var egyezes=0.3;
      if (commands[commandgroup][i].difference!=null){  //2
        egyezes = commands[commandgroup][i].difference;
      }        
      var c = minta.indexOf("%");
      if (c>-1){ //more parts split by %
        var parts=minta.split("%");
        var cmd=command;
        var dst=0;
        var chrs=0;
        var res=null;
        var minip=[];
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];        
          res = getEditDistance2(p,cmd);  //(part,cmd) ->  [dist,chars,newcmd,%paramvalue]
          if (res==null){
            break;
          }
                 
          dst+=res[0];
          chrs+=res[1];
          cmd=res[2];
          minip.push(res[3]);        
          if (cmd==null){
            break;
          } 
        }
        if (res!=null){
          var sym=dst/chrs;//similarity
          if ((sym<egyezes) && (sym<minv)){
            mini=i;
            minv=sym; 
            minparams=minip;         
          }
        }
      }else {
        if (command.startsWith(minta)) {
          mini=i;
          minv=-1;
          break;
        } else {   
          var sym=getSimilarity(commands[commandgroup][i].command, command); //1
          if ((sym<egyezes) && (sym<minv)){
            mini=i;
            minv=sym;
          }
        }
      }
    }  
    
    if (minv<egyezes){
      console.log(commands[commandgroup][mini].command,command); //1
      processSpeech(mini,command,minv,minparams);
    } else {
      console.log(minv,command);
      SpeechToInputbox(command);//end if INPUT
      if (!SPHistory.ellapsed()){
        command=command.split(" ")[0]; //only one word
        switch (SPHistory.mode){
          case 1:
            SP_renametable(0,0,0,[command]); 
            break;
          case 2:
            SP_renamefield(0,0,0,[command]); 
            break;
          default:
            break;
  
        }
      }
    }
  }
  
  function processSpeech(idx,command,minv,minparams=null){
    if (idx>-1){ //yes or no -1
      var cases=commands[commandgroup][idx].grp; //0
      SPHistory.add([idx,command,minv,minparams],cases);
    }
    if (speechlevel>0){
      cases=speechlevel;    
    }
    if (cases<999){
      SpeechToInputbox(command);
    }
    switch (cases){
      case 1: //TODO Tablemaker
        SP_maketables(command.match(/\d/g));      
        break;
      case 2:
        SP_link(idx,command,minv,minparams);
        break;
      case 3:
        SP_blinder(1);  
        break;
      case 4:
        SP_blinder(0);  
        break;
      default:
        SpeechToInputbox(command);
        break;
    }
    //Save(temp);
  }
  

  function SP_blinder(open){
    if (open==1){
        document.getElementById("remote").innerHTML='<object type="text/html" data="http://192.168.1.115:9249/close" ></object>';
    } else {
        document.getElementById("remote").innerHTML='<object type="text/html" data="http://192.168.1.115:9249/open" ></object>';
    }
  }

  function opensite() {
    document.getElementById("content").innerHTML='<object type="text/html" data="http://192.168.1.115:9249/close" ></object>';
  }


  
  
  function SP_smile(){
    var img = document.getElementById("smile");
    if (img!=null){
      img.src = "";
      img.src = imgs+"smile.gif";
      img.style.opacity=1.0;
      img.style.visibility="visible";
      var a= function(){
        img.style.opacity=img.style.opacity-0.03;
        if (img.style.visibility=="visible")
          window.setTimeout(a, 50);  
      }
      window.setTimeout(a, 100);
      window.setTimeout(function(){
        img.style.visibility="hidden";
      },2000);
    }
  
  }
  
  
  function SP_link(idx,command,minv,minparams){
    if (idx<1) return;  
    if (idx>=commands[commandgroup].length) return;
    if ((minparams!=null) && (minparams.length>1)) {
      var id2="id";
      var id1="id"+minparams[1];
      var t1=SearchTableByName(minparams[0]);
      var t2=SearchTableByName(minparams[1]);
      if ((t1!=null)&&(t2!=null)){
        var f1 = t1.AFields.SearchFieldByName(id1);
        var f2 = t2.AFields.SearchFieldByName(id2);
        if (f1==null){ //null??
          f1 = t1.addField(id1,1);
          t1.refreshDOM();
        }
        if (f2==null){ //null??
          f2 = t2.addField(id2,3);
          t2.refreshDOM();
        }
        f1.addLink(f2);
        t1.refreshConstraints();
      }
    }
  }
  
  function SP_maketables(num){
    num=Math.min(10,Math.abs(Math.floor(num)));
    var table=null;
    for (let i = 0; i < num; i++) {
      table = newTable();  
      table.moveToPosition((i*10)+(Math.floor(Math.random()*8)*120),Math.floor(Math.random()*4)*130);
    }
    if (table!=null)
      table.Selected();
    return num;  
  }
  
  
  //#endregion SPEECH 
  
  //#region printdocument
  
  
  //#region IETOOLS
  
  
  
  //#endregion IETOOLS