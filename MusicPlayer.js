var AJAX = {

	request: function(url){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, false);
		xhr.send();

		return xhr.responseText;
	},
	
	requestGET: function(url){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.send();
		return xhr.responseText;
	},
	
	requestDB: function(info,url,id,title,artist) {
		var xhr = new XMLHttpRequest();
		xhr.open(info,url);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send("artist="+artist+"&title="+title+"&track_id="+id+"&playlist_id=1");

		return xhr.responseText;
	}
	
}

var Layout = {
	createContainer: function(id, element){
    	var container = document.createElement(element);
		container.id = id;

		return container;
    },
    createImage: function(src, alt, url){
    	var img = document.createElement("img");
	    img.src = src;
	    img.alt = alt;
		img.href = url;
	    return img;
    },
    renderContainer: function(container){
		var section = document.getElementById("videos");
		section.appendChild(container);
    },
	
	renderContainerRecom: function(container){
		var section = document.getElementById("recommendations");
		section.appendChild(container);
    }
}

var Videos = {
	api: {},
	songlist_id: "songs",
    getTracks: function(){
    	var json_response = JSON.parse(this.api.request());
    	return this.api.getTracks(json_response);
    },

    createTrackImage: function(src, title, url){
    	var figure = document.createElement("figure");

    	var img = Layout.createImage(src, title, url);

		Listener.add(img,"click",Listener.eventPlay,false);
		
	    figure.appendChild(img);
		
	    return figure;
    },

    createTitle: function(idtitle,title){
    	var title_tag = document.createElement("p");
		if (title == '') title_tag.innerHTML = "MISSING DATA";
		else title_tag.innerHTML = title;
		title_tag.id = idtitle;
	    return title_tag;
    },
	
	sendQueryDB: function(track_id,track_title,track_artist) {
		this.api.updateSQLURL("http://api.hipermedia.local/music/new");
		var response_sql = this.api.sendQueryDB(track_id,track_title,track_artist);
		console.log(response_sql);
	},

    appendTrackImage: function(track, container, index) {
		var src 		= this.api.getImagePath(track);
		var track_title = this.api.getTrackTitle(track);
		var track_id 	= this.api.getTrackMBID(track);
		var track_artist = this.api.getTrackArtist(track);
		var youtube_url = "http://gdata.youtube.com/feeds/api/videos?q="+track_title+" - "+track_artist+"&start-index=1&max-results=1&v=2&alt=json";
		this.api.updateYoutubeURL(youtube_url);
		var track_url 	= this.api.getYoutubeURL(this.api.requestSearchYoutube());
		var api_key 	= "&api_key=d700cc0500985e76094a97d8ec4c5903&artist="+track_artist+"&track="+track_title+"&format=json";
		var url_info 	= "http://ws.audioscrobbler.com/2.0/?method=track.getInfo"+api_key;
		this.api.updateCurrentURL(url_info);
		var track_album = this.api.getTrackAlbum(this.api.requestAlbum());
		var song_id 	= "song" + index;
	
		var list_item = Layout.createContainer(song_id, "li");
		list_item.appendChild(this.createTrackImage(src, track_title, track_url));
		list_item.appendChild(this.createTitle("title"+song_id,track_title));
		//list_item.appendChild(this.createTitle(track_id));
		list_item.appendChild(this.createTitle("artist"+song_id,track_artist));
		list_item.appendChild(this.createTitle("album"+song_id,track_album));
		list_item.appendChild(this.createTitle("id"+song_id,track_id));

		return list_item;
	},

	renderTracksList: function(tracks,container){
		
		for (var i = 0; i < tracks.length; i++) {
			list_item = this.appendTrackImage(tracks[i], container, i);
			container.appendChild(list_item);
		};

		Layout.renderContainer(container);
	},

	replaceImageByVideo: function(video_url){
		var footer = document.getElementById("footerclick");
		footer.innerHTML = '<embed src="'+ video_url +'">';
	},

	resetApplication: function(){
		var container = document.getElementById(this.songlist_id);
		var container2 = document.getElementById(this.recommended_id);
		
		if(container){
			container.parentNode.removeChild(container);
		};
		
		if(container2){
			container2.parentNode.removeChild(container2);
		}
	},

    start: function(api){
    	this.api = api;

    	var container = Layout.createContainer(this.songlist_id, "ul");
		this.renderTracksList( this.getTracks(), container );
    },
	
	startRecommendations: function(apiRec) {
		this.resetApplication();
		this.api = apiRec;
		
		//CODI QUE S'USARIA SI AIXO FUNCIONES
		//AGAFARIA ELS 10 ULTIMS REPRODUITS I AGAFARIA A LO RANDOM UN TITOL DE CANCO
		//D'AQUEST TITOL DE CANCO FARIA UNA CERCA DE CANCO, COM SI HAGUESSIS FET UN SEARCH AMB EL NOM SELECCIONAT
		// this.api.updateSQLURL("http://api.hipermedia.local/music");
		// var response = JSON.parse(this.api.requestLastMusics());
		// console.log(response);
		// var container = Layout.createContainer(this.songlist_id, "ul");
		// if (response.data != undefined && response.data != null && (response.data.length > 0 || response.data.length == 1 && response.data[0] != "")) {
			// var x = Math.floor(Math.random() * response.data.length);
			// var query = response.data[x].title;
			// var apiKey = "&api_key=d700cc0500985e76094a97d8ec4c5903&limit=10&format=json";
			// var api_url = "http://ws.audioscrobbler.com/2.0/?method=track.search&track="+query+apiKey;
			// this.updateAPIURL(api_url);
			// var response_json = JSON.parse(this.api.request());
			// console.log(response_json);
			// for (var i = 0; i < response_json.data.length; i++) {
				// list_item = this.appendTrackImage(tracks[i], container, i);
				// container.appendChild(list_item);
			// };
		// }
		// Layout.renderContainerRecom(container);
		this.api.updateAPIURL("http://ws.audioscrobbler.com/2.0/?method=tag.getTopTags&api_key=d700cc0500985e76094a97d8ec4c5903&format=json");
		var response_json = JSON.parse(this.api.request());
		console.log(response_json);
		var x = Math.floor(Math.random() * response_json.toptags.tag.length);
		var tag = response_json.toptags.tag[x].name;
		this.api.updateAPIURL("http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag="+tag+"&api_key=d700cc0500985e76094a97d8ec4c5903&limit=10&format=json");
		var track_response = JSON.parse(this.api.request());
		console.log(track_response);
		var tracks = track_response.toptracks.track;
		var container = Layout.createContainer(this.songlist_id, "ul");
		for (var i = 0; i < tracks.length; i++) {	
			list_item = this.appendTrackImage(tracks[i], container, i);
			container.appendChild(list_item);
		};
		Layout.renderContainerRecom(container);
	}
}

function MusicLastFM(api_url){
	this.api_url = api_url;
	this.current_url = "";
	this.youtube_url = "";
	this.sql_url = "";

	this.requestLastMusics = function(){
		return AJAX.requestGET(this.sql_url);
	}
	
	this.request = function(){
		return AJAX.request(this.api_url);
    }
	
	this.requestAlbum = function(){
		return AJAX.request(this.current_url);
	}
	
	this.requestSearchYoutube = function(){
		return AJAX.request(this.youtube_url);
	}
	
	this.sendQueryDB = function(track_id,track_title,track_artist){
		return AJAX.requestDB("POST",this.sql_url,track_id,track_title,track_artist);
	}
	
	this.getQueryDB = function() {
		return AJAX.request(this.sql_url);
	}

	this.getTracks = function(track_object)
	{
		return track_object.results.trackmatches.track;
	}

	this.getImagePath = function(track)
	{
		if (!track.hasOwnProperty('image')){
			return "images/no_image.gif";
		}
		else return track.image[2]["#text"];
	}

	this.getTrackTitle = function(track)
	{
		if (!track.hasOwnProperty('name')){
			return "Missing title data";
		}
		else return track.name;
	}
	
	this.getTrackMBID = function(track)
	{
		return track.mbid;
	}
	
	this.getTrackArtist = function(track)
	{
		if (track.artist.hasOwnProperty('name')) return track.artist.name;
		else return track.artist;
	}
	
	this.getTrackAlbum = function(track_object)
	{
		var title = "No Album Data Available";
		var json_response = JSON.parse(track_object);
		if (json_response == undefined){
			return "Missing Album Title data";
		} if (!json_response.hasOwnProperty('track')){
			return "Missing Album Title data";
		} else if (!json_response.track.hasOwnProperty('album')) {
			return "Missing Album Title data";
		} else if (!json_response.track.album.hasOwnProperty('title')) {
			return "Missing Album Title data";
		}
		else return json_response.track.album.title;
	}
	
	this.getYoutubeURL = function(track_object)
	{
		var title = "No URL Available";
		var json_response = JSON.parse(track_object);
		return json_response.feed.entry[0].content.src+"&autoplay=1";
	}

	this.updateCurrentURL = function(url_info)
	{
		this.current_url = url_info;
	}
	
	this.updateYoutubeURL = function(url_info)
	{
		this.youtube_url = url_info;
	}
	
	this.updateSQLURL = function(url_info)
	{
		this.sql_url = url_info;
	}
	
	this.updateAPIURL = function(url_info)
	{
		this.api_url = url_info;
	}
	
}

var Application = {
	
	start: function(){
		var button = document.getElementById("buttonSearch");
		Listener.add(
			button,
			"click",
			Listener.eventSearch,
			false
		);
		Videos.startRecommendations(new MusicLastFM(""));
	},
	
	startSearch: function(query){
		var apiKey = "&api_key=d700cc0500985e76094a97d8ec4c5903&limit=10&format=json";
		var api_url = "http://ws.audioscrobbler.com/2.0/?method=track.search&track="+query+apiKey;
		Videos.start(new MusicLastFM(api_url));
	}
}

var Listener = {
	
	add: function(object, event, callback, capture){
		object.addEventListener(event,callback,capture);
	},
	
	eventPlay: function(event){
		event.preventDefault();
		var elem = event.target.parentNode.parentNode;
		var title = document.getElementById("title"+elem.id).innerHTML;
		var artist = document.getElementById("artist"+elem.id).innerHTML;
		var idsong = document.getElementById("id"+elem.id).innerHTML;
		Videos.sendQueryDB(idsong,title,artist);
		Videos.replaceImageByVideo(event.target.href);
	},
	
	eventSearch: function(event){
		console.log("You clicked the button");
		var query = document.getElementById("inputSearch").value;
		if(!query){
			console.log(query);
			alert("Your search is short.");
			return false
		}
		Application.startSearch(query);
	}
	
}

Listener.add(
	document,
	"DOMContentLoaded",
	Application.start(),
	capture = false
);
