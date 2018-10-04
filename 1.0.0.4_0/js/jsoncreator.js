jsonCreator = function(){
    this.json = "null";
    this.addstring = addstring;
    this.addindex = addindex;
    this.addstringarray = addstringarray;
    this.addindexarray = addindexarray;
    this.getarray = getarray;
    this.get = get;

    function addstring(key, value){
        if (this.json == "null")
            this.json = "\"" + key + "\":\"" + value + "\"";
        else
            this.json += ",\"" + key + "\":\"" + value + "\"";
    }

    function addindex(key, value){
        if (this.json == "null")
            this.json = "\"" + key + "\":" + value;
        else
            this.json += ",\"" + key + "\":" + value;
    }


    function addstringarray(value){
        if (this.json == "null")
            this.json = "\"" + value + "\"";
        else
            this.json += ",\"" + value + "\"";
    }

    function addindexarray(value){
        if (this.json == "null")
            this.json = value;
        else
            this.json += "," + value;
    }

    function getarray(){
        if (this.json == "null")
            this.json = "";

        var jsonstore = "[" + this.json + "]";
        return jsonstore;
    }
    function get(){
        if (this.json == "null")
            this.json = "";

        var jsonstore = "{" + this.json + "}";
        return jsonstore;
    }
};

var ajaxurl, resType, resDataType, POSTstr;

document.getElementById('test').onclick = function()
{
	console.log('hi');
	var resolution = "1280x720";
	var fps = 15.0;

	var req_json = new jsonCreator();
	req_json.addstring("action","setting");
	req_json.addstring("resolution",resolution);
	req_json.addstring("fps",fps);

	resDataType = "json";
	ajaxurl = "http://10.10.10.1/video_setting.cgi";
	POSTstr = req_json.get();

	console.log('post string = ', POSTstr);
}

$.ajax({
    url: ajaxurl,
    type: resType,
    data: POSTstr,
    cache: false,
    headers: { "cache-control": "no-cache" },
    dataType: resDataType,
    async: true,
    timeout: 60000,
    success: function(data, textStatus, XMLHttpRequest) {
        var option_hmtl ='';
                    var resolution_list_array = new Array();

                    if (video_obj.mjpg_paused){break;}

                    for( var i = 0; i < data.resolution_list.length; i++){
                        if(parseInt(data.resolution_list[i].resolution.split("x")[0]) >= 352 && parseInt(data.resolution_list[i].resolution.split("x")[0]) <= 1600)
                            resolution_list_array.push(data.resolution_list[i].resolution.split("x")[0]);
                    }

                    resolution_list_array.sort(sortNumber);         //sort resolution list

                    for( var i = 0; i < data.resolution_list.length; i++){
                        for( var j = 0; j < data.resolution_list.length; j++){
                            if( resolution_list_array[i] == data.resolution_list[j].resolution.split("x")[0] && option_hmtl.search(data.resolution_list[j].resolution) == -1){          //Add option for sorted resolution list and delete repeat option
                                option_hmtl += '<option value="' + data.resolution_list[j].resolution +'_'+ data.resolution_list[j].fps + '">' + data.resolution_list[j].resolution + '</option>';
                                break;
                            }
                        }
                    }

                    var list_obj = $("#resolution_list_select");
                    var old_choose = "";

                    if(list_obj.val())
                        old_choose = list_obj.val().split("_")[0];

					console.log('list = ',list_obj.val());

                    if(option_hmtl != video_obj.old_option_html || old_choose != data.resolution_use || video_obj.resolution != data.resolution_use){                   //If the option is changed, then update combobox
                        list_obj.children().remove();
                        list_obj.append(option_hmtl);
                        video_obj.old_option_html = option_hmtl;

                        if(data.resolution_list.length == 0){return;} //no cam

                        list_obj.children().each(function(){
                            if ($(this).text() == data.resolution_use){
                                this.selected = true;
                            }
                        });

                        if(video_obj.status == 0){
                            change_preview_resolution(data.resolution_use);
                        }
                        video_layout_refresh(data.resolution_use);
                        //change_preview_resolution(list_obj.val().split("_")[0]);
                    }
    },
    error: function(XMLHttpRequest, textStatus)
    {
		console.log('error');
    }
});