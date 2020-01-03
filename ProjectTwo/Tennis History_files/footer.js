try
{
	var objTournamentResultsTable = $('#ctl00_mainContent_dgTournaments');
	if (objTournamentResultsTable.length == 1 && objTournamentResultsTable.find('tr').length > 0)
	{
		var objTable = $('<table>');
		var objTBody = $('<tbody>');
		objTable.append(objTBody);
                var objHeaderRow = $('<tr>');
                objTBody.append(objHeaderRow);
		objHeaderRow.append(objTournamentResultsTable.find('tr').eq(0).find('td').eq(0));
		objHeaderRow.append(objTournamentResultsTable.find('tr').eq(0).find('td').eq(0));
		objHeaderRow.append($('<td>').addClass('subhead'));
                if (objTournamentResultsTable.find('tr').length > 1) {
		for (var i=1; i<objTournamentResultsTable.find('tr').length; i++)
		{
			var objTournamentResultsTableRow = objTournamentResultsTable.find('tr').eq(i);
			var objRow = $('<tr>');
			objTBody.append(objRow);
			objRow.append(objTournamentResultsTableRow.find('td').eq(0));
                        var objLink = objTournamentResultsTableRow.find('td').eq(0).find('a').not('.tooltip2');
                        var objCell = $('<td>').append(objLink).append('<br />');
			objRow.append(objCell);
			objCell.append(objTournamentResultsTableRow.find('td').eq(1).html());
			var objDiv = $('<div>');
			objDiv.attr('id','divInfo'+i);
			objDiv.append(objTournamentResultsTableRow.find('td').eq(0).html());
			objCell.append(objDiv);
			objDiv.hide();
			objRow.append($('<td>').html('<a id=\'lnkInfo' + i + '\' href=\'javascript:void(0);\' onclick=\'toggleInfoDiv("#' + objDiv.attr('id') +'",this);\'>More Info</a>'));
			objDiv.append(objTournamentResultsTableRow.find('td').eq(2).html());
			objDiv.append(objTournamentResultsTableRow.find('td').eq(3).html());
			objDiv.append(objTournamentResultsTableRow.find('td').eq(4).html());
                }
                }
		objTournamentResultsTable.find('tbody').html(objTBody.html());
	}
	objTournamentResultsTable.show();
}
catch (e)
{
     alert(e);
}

function toggleInfoDiv(divID, linkElement)
{
	if ($(divID).is(":visible"))
	{
		$(divID).hide();
		$(linkElement).html('More Info');
	}
	else
	{
		$(divID).show();
		$(linkElement).html('Less Info');
	}
}

jQuery("#aspnetForm").prepend(jQuery("#ctl00_mainContent_btnRegister2"));
    