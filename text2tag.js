/* input,output :string 
change a text pattern to xml tag*/
var mpps_yinshun_note=function(content){
	content=content.replace(/（?印順法師，《?大智度論筆記》[〔［](.+?)[〕］]p\.(\d+)；[〔［](.+?)[〕］]p\.(\d+)）/g,function(m,bk1,pg1,bk2,pg2){
		return '<note_mpps ref="'+bk1+'#'+pg1+'"/><note_mpps ref="'+bk2+'#'+pg2+'"/>';
	});

	return content.replace(/（?印順法師，《?大智度論筆記》[〔［](.+?)[〕］]p\.(\d+)）/g,function(m,bk,pg){
		return '<note_mpps ref="'+bk+'#'+pg+'"/>';
	});
}

var taisho=function(content) {
	return content.replace(/（大正(\d+)，(.+?)，n\.(.+?)）/g,function(m,vol,pg,sutra){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'" n="'+sutra+'"/>';
	}).replace(/（大正(\d+)，(.+?)）/g,function(m,vol,pg){
		return '<note_taisho vol="'+vol+'" pg="'+pg+'"/>';
	});
}

var see_previous_juan=function(content){
	content=content.replace(/（承上卷(\d+)）/g,function(m,juan){
		return '<note_juan n="'+juan+'"/>';
	}).replace(/（承上卷(\d+)〈(.+)〉）/g,function(m,juan,vagga){
		return '<note_juan n="'+juan+'" vagga="'+vagga+'"/>';
	}).replace(/（承上卷(\d+)～卷?(\d+)）/g,function(m,juan,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'"/>';
	}).replace(/（承上卷(\d+)〈(.+)〉～卷?(\d+)）/g,function(m,juan,vagga,j2){
		return '<note_juan n="'+juan+'" n2="'+j2+'" vagga="'+vagga+'"/>';
	}).replace(/（承上卷(\d+)（大正(\d+)，([0-9abc]+)-([0-9abc]+)））/g,function(m,juan,vol,r1,r2){
		return '<note_juan n="'+juan+'" taisho="'+vol+'" from="'+r1+'" to="'+r2+'"/>';
	});
	return content;	
}

var pb=function(content){
	return content.replace(/`(\d+)`/g,function(m,m1){
		return '<pb n="'+m1+'"/>';
	});
}

var kai=function(content){
	return content.replace(/\^([\s\S]*?)\^\^/g,function(m,m1){
		return "<kai>"+m1+"</kai>";
	});
}

/* assuming 論 is bold , because ndef might have 【論】, juan #85.70 */
var jinlun=function(content) {
	//jin and lun has it own line.
	//first 40 juan text might follow jin/lun marker
	return content.replace(/【<b>經<\/b>】/g,"<jin/>")
	//.replace(/【經】/g,"<jin>經</jin>")
	.replace(/【<b>論<\/b>】/g,"<lun/>")
	.replace(/【<b>論<\/b>(<note .*?>)】/g,function(m,note){ //juan 51 lun has note
		return "<lun/>"+note;
	})
	//.replace(/【論】/g,"<lun>論</lun>");
}

var doAll=function(content) {
	content=jinlun(content);
	content=kai(content);
	content=pb(content);
	content=mpps_yinshun_note(content);
	content=taisho(content);
	return content;
}
module.exports={doAll,taisho,see_previous_juan,mpps_yinshun_note
	,pb,kai,jinlun};