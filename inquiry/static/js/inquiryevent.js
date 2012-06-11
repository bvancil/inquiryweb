function referant_link(pk)
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
	html += referant_link(referants[i]);
    }
    return html;
}

function inquiry_event_html(e) 
{
    return '<div class="inquiryevent" id="event' + e["pk"] + '"><a class="eventmeat" href="/inquiry/event/' + e["pk"] + '"><span class="eventtype">' + e["fields"]["event_type"] + '.&nbsp;</span><span class="eventdescription">' + e["fields"]["description"] + '</span></a><div class="eventmeta">by ' + '<a class="eventauthor" href="/inquiry/author/' + e["fields"]["author"] + '">' + e["fields"]["author"] + '</a> (last modified on ' + e["fields"]["mod_datetime"] + ' in response to ' + referants_links(e) + ') <span class="eventchoices"><a href="">Respond</a> <a href="">Tag</a></span></div></div>';
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
    document.write(html);
}

function insert_response_form_to(pk)
{
    var id = "event" + pk;
    return "";
}