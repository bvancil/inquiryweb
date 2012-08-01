function InquiryEvent(ev) { 
    /*
ev is json data for the event
Example ev:
    {"pk": 1, "model": "inquiry.event", "fields": {"description": "Why?", "author": 1, "referants": [], "mod_datetime": "2012-02-11T00:01:18", "add_datetime": "2012-02-11T00:01:18", "event_type": "Q"}}
    */
    //alert(ev);
    this.pk = ev["pk"];
    this.id = "event"+this.pk;
    this.event_type = ev["fields"]["event_type"];
    this.description = ev["fields"]["description"];
    this.author = ev["fields"]["author"];
    this.authorName = this.author;
    var thisevent = this;
    $.get("/inquiry/author/" + this.author, function(data) {
	thisevent.authorName = data;
	}); // We might need to check later to make sure that this has returned a value when we write out the html or set a callback to update the html instead.
    this.referants = ev["fields"]["referants"];
    this.add_datetime = ev["fields"]["add_datetime"];
    this.mod_datetime = ev["fields"]["mod_datetime"];
    //return this;
}
InquiryEvent.prototype.referants_links = function() {
    var referants = this.referants;
    var html = '';
    var len = referants.length;
    if (len == 0) return 'a whim.';
    for(var i=0; i<len; i++)
    {
	html += event_link(referants[i]);
    }
    return html;
};
InquiryEvent.prototype.html = function() {
    return '<div class="inquirythread" id="thread' + this.pk + '"><div class="inquiryevent" id="event' + this.pk + '"><a class="eventmeat" href="/inquiry/event/' + this.pk + '"><span class="eventtype">' + this.event_type + '.&nbsp;</span><span class="eventdescription">' + this.description + '</span></a><div class="eventmeta">by ' + '<a class="eventauthor" href="/inquiry/author/' + this.author + '" title="' + this.author + '">' + this.authorName + '</a> (last modified on ' + this.mod_datetime + ' in response to ' + this.referants_links() + ') <span class="eventchoices"><a href="">Respond</a> <a href="">Tag</a></span></div></div><ol class="referants" id="referants' + this.pk + '"></ol></div>';
};

function formatDate(date, fmt) {
    function pad(value) {
        return (value.toString().length < 2) ? '0' + value : value;
    }
    return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
        switch (fmtCode) {
        case 'Y':
            return date.getUTCFullYear();
        case 'M':
            return pad(date.getUTCMonth() + 1);
        case 'd':
            return pad(date.getUTCDate());
        case 'H':
            return pad(date.getUTCHours());
        case 'm':
            return pad(date.getUTCMinutes());
        case 's':
            return pad(date.getUTCSeconds());
        default:
            throw new Error('Unsupported format code: ' + fmtCode);
        }
    });
}

function event_link(pk)
{
    return '<a href="/inquiry/event/' + pk + '">[' + pk + ']</a>';
} 

function referants_links(e) 
{
    var referants = e["fields"]["referants"];
    var html = '';
    var len = referants.length;
    if (len == 0) return 'a whim.';
    for(var i=0; i<len; i++)
    {
	html += event_link(referants[i]);
    }
    return html;
}

function inquiry_event_html(e) 
{
    return EventObj.html();
}

// not currently used
function write_child_list(e)
{
    // TODO: needs to be updated to use XHR and be recursive and not refer to the global "children" variable
    var html = '<ol>';
    var len=children.length;
    for(var i=0; i<len; i++) {
	html += '<li>'+inquiry_event_html(children[i])+'</li>';
    }
    html += '</ol>';
    //$('#foss').html(html); // why doesn't this work?
    document.write(html);
    retrieve_authors();
}

// not currently used
function insert_response_form_to(pk)
{
    var id = "event" + pk;
    return "";
}

// not currently used
function retrieve_authors() {
    // replace numerical author IDs with names
    $(".eventauthor").each(function() {
	var anchor = $(this);
	//alert(anchor.html());
	$.get("/inquiry/author/" + anchor.html(), function(data) {
	    //alert(data);
	    anchor.html(data);
	});
    });
}

function add_new_inquiry_event(event) {
    var first_referant = 1e13;
    var referant;
    for (var i=0; i<event.referants.length; i++) {
	referant = event.referants[i];
	if ((referant < first_referant) && (referant in Events)) {
	    first_referant = referant;
	}
    }
    $("#referants"+first_referant).append("<li>"+event.html()+"</li>");
    $("#thread"+event.pk).hide().fadeIn("slow");
    Events[event.pk]=event; // Finally add it to the included events.
}
			   

function process_new_inquiry_events(json) {
    for (var i=0; i< json.length; i++) {
	if (!(json[i]["pk"] in Events)) { // Make sure this event is not already represented.
	    var newEvent = new InquiryEvent(json[i]);
	    add_new_inquiry_event(newEvent);
	}
    }
}

function refresh_page() {
    //var updateURL = '/inquiry/event/'+event["pk"]+'/updates/' + event_timestamp(new Date()) + '/json';
    var updateURL = '/inquiry/event/'+Event["pk"]+'/updates/' + LastUpdated + '/json';
    //var updateURL = '/inquiry/event/1/updates/2000-01-01T00:00:00/json'; // for testing
    var call = $("#test1");
    call.html(updateURL);
    var response = $("#test2");
    response.fadeOut("slow").load(updateURL).fadeIn("slow");
    $.ajax({
	url: updateURL,
	dataType: "json",
	success: function(data) {
	    process_new_inquiry_events(data);
	},
    });
    replace_author_ids_with_names();
}

function event_timestamp(js_timestamp) {
    return formatDate(js_timestamp, '%Y-%M-%dT%H:%m:%s');
}

function replace_author_ids_with_names() {
    var unique_authors = {};
    for (var eventId in Events) {
	var author = Events[eventId].author;
	if (!(author in unique_authors)) {
	    unique_authors[author] = true;
	}
    }
    for (var author in unique_authors) {
	ajax_author_name(author);
    }
}

// Stuff to run immediately:
var LastUpdated = Event["fields"]["add_datetime"];
var EventObj = new InquiryEvent(Event);
var EventId = EventObj.pk;
var Events = {};
Events[EventId] = EventObj;
// Stuff to save until the document is ready:
$(document).ready(function() {
    $("#foss").html(inquiry_event_html(Event));
    $("#thread"+EventId).hide();
    refresh_page();
    var refreshID = setInterval(refresh_page, 10000);
    $.ajaxSetup({cache: false});
    replace_author_ids_with_names();
    $("#thread"+EventId).show();
});



function insert_author_names(data, textStatus, jqXHR) { // Here this is a DOM element that refers to the anchor refering to the author with class "eventauthor"; title attr is set to author id
    $(this).html(data); 
}
 
function ajax_author_name(author_id) {
    $.ajax({
	url: "/inquiry/author/" + author_id,
	context: $(".eventauthor[title="+author_id+"]"),
	dataType: "text",
	success: insert_author_names,
    });
}