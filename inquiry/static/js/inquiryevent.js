function inquiry_event_html(e) 
{
    return '<div class="inquiryevent" id="event' + e["pk"] + '">' + e["fields"]["event_type"] + '. ' + e["fields"]["description"] + '</div>'
}

function write_child_list(e)
{
    // TODO: needs to be updated to use XHR and be recursive and not refer to the global "children" variable
    document.write('<ul>');
    var len=children.length;
    for(var i=0; i<len; i++) {
	document.write('<li>'+inquiry_event_html(children[i])+'</li>');
    }
    document.write('</ul>');
}
