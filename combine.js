/* combine 100 juan into 3 files, jin, luan and ndef */

/*

note:   #\d+\.\d+   #juan.seq


*/
var sourcepath="genxml/";
var lst='genxml/mpps.lst';
var fs=require("fs");
var lst=fs.readFileSync(lst,"utf8").split(/\r?\n/);
var jin=[],luan=[],ndef=[];
var out=luan,prevout;

var checkContent=function(fn,content){
	var notallow=["^","{","}","~"];
	notallow.map(function(pat){
		if (content.indexOf(pat)>-1)console.log(fn+" cannot have "+pat);
	})
}
var processfile=function(fn){
	var juan=parseInt(fn.substr(sourcepath));
	group=1;
	out.push('^'+juan);
	var content=fs.readFileSync(sourcepath+fn,"utf8");
	checkContent(fn,content);
	var lines=content.split(/\r?\n/);
	if (prevout) out=prevout;

	for (var i=2;i<lines.length-1;i++) { //omit first 2 line and last line
		var line=lines[i];
		if (line.indexOf("<luan")>-1) {
			out=luan;
			out.push('^'+juan+'.'+group);
		} else if (line.indexOf("<ndef")>-1) {
			if (out!=ndef) prevout=out;
			out=ndef;
			line=line.replace('<ndef n="','<ndef n="'+juan+".");
		} else if (line.indexOf("<jin")>-1) {
			out=jin;
			out.push('^'+juan+'.'+group);
			group++;
		}

		if (line.indexOf('repeat="true"')==-1) {

			line=line.replace(/<note n="(\d+)"\/>/g,function(m,m1){
				return "#"+juan+"."+m1;
			})

			out.push(line);	

		}
	}
}

var replaceRef=function(str){
	// @[_a-zA-z0-9\-]
  return str.replace(/<taisho n="(.*?)"\/>/g,function(m,m1){
		return "@t"+m1.replace(".","p");  //大正藏聯結
  })
  .replace(/<note_mpps ref="(.*?)"\/>/g,function(m,m1){
		return "@y"+m1.replace("#","p"); //導師大智度論筆記
		//y_A036p69
  })
  .replace(/<note_taisho vol="(.*?)" pg="(.*?)" n="(.*?)"\/>/g,function(m,vol,pg,n){
  	//taisho apparatus
  	return "@t"+vol+"p"+pg+n;
  })
  .replace(/<note_taisho vol="(.*?)" pg="(.*?)"\/>/g,function(m,vol,pg){
  	//taisho apparatus
  	return "@t"+vol+"p"+pg;
  })
}
var replaceFont=function(str){
	str= str.replace(/<kai>/g,"{k").replace(/<\/kai>/g,"k}")
  .replace(/<b>/g,"{").replace(/<\/b>/g,"}")
  .replace(/<u>/g,"{u").replace(/<\/u>/g,"u}")
  .replace(/{u{/g,"{u").replace(/}u}/g,"u}")

  return str;
}
var replace=function(str){
return str.replace(/<pb n="(\d+)"\/>/g,function(m,m1){
		return "~"+m1;
  })
  .replace(/<h(\d+) t="(.*?)">(.*?)<\/h\d+>/g,function(m,depth,m1,m2){
  	return "%"+depth+" "+m1+m2
  })
  .replace(/<h(\d+)>(.*?)<\/h\d+>/g,function(m,depth,m2){
  	return "%"+depth+" "+m2; //without t
  })  
	.replace(/%(\d+) ~(\d+)/g,function(m,depth,pb){
		return "~"+pb+"%"+depth+" "; //swap pb and depth , pb must before kepan
	})  
	.replace(/~(\d+)%/g,function(m,pb){
		return "~"+pb+"\n%";  //pb has own line if followed by kepan
	})
  .replace(/<body>/g,"")
}

lst.map(processfile);
jin=jin.join("\n");
jin=jin.replace(/<kai>/g,"").replace(/<\/kai>/g,"");//all jin is kai
jin=replace(jin);
jin=replaceRef(jin);
jin=replaceFont(jin);
jin=jin.replace(/<jin>經<\/jin>/g,"");
jin=jin.replace(/\{/g,"").replace(/\}/g,"");
jin=jin.replace(/<\/b>(#\d+)<b>/g,function(m,m1){return m1});

luan=replace(luan.join("\n"));
luan=replaceRef(luan);
luan=replaceFont(luan);
luan=luan.replace(/<luan>論<\/luan>/g,"");

ndef=ndef.join("\n");
ndef=replaceRef(ndef);
ndef=replaceFont(ndef);
ndef=ndef.replace(/<ndef n="(.*?)"\/>/g,function(m,m1){
	return "#"+m1;
})

fs.writeFileSync("jin.xml",jin,"utf8");
fs.writeFileSync("luan.xml",luan,"utf8");
fs.writeFileSync("ndef.xml",ndef,"utf8");