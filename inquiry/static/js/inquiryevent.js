function InquiryEvent(ev) { 
    /*
ev is json data for the event
Example ev:
    {"pk": 1, "model": "inquiry.event", "fields": {"description": "Why?", "author": 1, "referants": [], "mod_datetime": "2012-02-11T00:01:18", "add_datetime": "2012-02-11T00:01:18", "event_type": "Q"}}
    */
    this.pk = ev["pk"];
    this.id = "#event"+this.pk;
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
    return '<div class="inquiryevent" id="event' + this.pk + '"><a class="eventmeat" href="/inquiry/event/' + this.pk + '"><span class="eventtype">' + this.event_type + '.&nbsp;</span><span class="eventdescription">' + this.description + '</span></a><div class="eventmeta">by ' + '<a class="eventauthor" href="/inquiry/author/' + this.author + '">' + this.author + '</a> (last modified on ' + this.mod_datetime + ' in response to ' + this.referants_links() + ') <span class="eventchoices"><a href="">Respond</a> <a href="">Tag</a></span></div></div>';
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
    return eventObj.html();
    //return '<div class="inquiryevent" id="event' + e["pk"] + '"><a class="eventmeat" href="/inquiry/event/' + e["pk"] + '"><span class="eventtype">' + e["fields"]["event_type"] + '.&nbsp;</span><span class="eventdescription">' + e["fields"]["description"] + '</span></a><div class="eventmeta">by ' + '<a class="eventauthor" href="/inquiry/author/' + e["fields"]["author"] + '">' + e["fields"]["author"] + '</a> (last modified on ' + e["fields"]["mod_datetime"] + ' in response to ' + referants_links(e) + ') <span class="eventchoices"><a href="">Respond</a> <a href="">Tag</a></span></div></div>';
}

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

function insert_response_form_to(pk)
{
    var id = "event" + pk;
    return "";
}

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

function process_new_events(json) {

}
			   
function refresh_page() {
    //alert("refresh");
    //var updateURL = '/inquiry/event/'+event["pk"]+'/updates/' + event_timestamp(new Date()) + '/json';
    var updateURL = '/inquiry/event/'+event["pk"]+'/updates/' + lastUpdated + '/json';
    //var updateURL = '/inquiry/event/1/updates/2000-01-01T00:00:00/json'; // for testing
    var call = $("#test1");
    call.html(updateURL);
    var response = $("#test2");
    response.fadeOut("slow").load(updateURL).fadeIn("slow");
}

function event_timestamp(js_timestamp) {
    return formatDate(js_timestamp, '%Y-%M-%dT%H:%m:%s');
}

// Stuff to run immediately:
var lastUpdated = event["fields"]["add_datetime"];
var eventObj = new InquiryEvent(event);
var eventId = eventObj.id;
var events = {eventId: eventObj};
// Stuff to save until the document is ready:
$(document).ready(function() {
    $("#foss").html(inquiry_event_html(event));
    //refresh_page();
    var refreshID = setInterval(refresh_page, 10000);
    $.ajaxSetup({cache: false});
});

