/** ### DOWNLOADING EXCEL FILE FROM JSON DATA ###
    ### Working for all Browser ###

    # All You need to change is to copy your Json data to this variable myList
    # The rest of the work this code can handle. 
    # If you want to change the theam or styling of the excel then you must need to 
    # change the code which is under the variable styleText
    # This is nothing but simple CSS code.

    ### CODE DEVELOPED BY SUMAN DEY ### **/

//Copy the Json to this variable.
function Download() {
    var myList = [{
        "Book ID": "1",
        "Book Name": "This is a long latter to get understand",
        "Category": "Computers",
        "Price": "125.60",
        "Hi": "125.60"

    }, {
        "Book ID": "2",
        "Book Name": "Asp.Net 4 Blue Book",
        "Category": "Programming",
        "Price": "56.00",
        "Hi": "125.60"

    }, {
        "Book ID": "3",
        "Book Name": "Popular Science",
        "Category": "Science",
        "Price": "210.40",
        "Hi": "125.60"
    }];

    //here we are crating a vertual html page using JavaScript whih can not be show in the body of our page.
    var html = document.createElement('html');
    var head = document.createElement('head');
    html.appendChild(head);
    var body = document.createElement('body');
    html.appendChild(body);
    var div = document.createElement('div');
    body.appendChild(div);
    var table = document.createElement('table');
    table.id = "excelDataTable";
    table.border = "1";
    div.appendChild(table);

    //Styling the Table 

    var style = document.createElement('style');
    head.appendChild(style);

    style.type = "text/css";

    //you can change the style of the excel header and body rows here.
    var styleText =
        ".innerTableData { background-color:rgb(91,155,213);color:rgb(255,255,255);font-weight: bold; } td { background-color:rgb(221,235,247); }";
    style.innerHTML = styleText;

    document.body.appendChild(html);


    //this for loop will create the header data for the html table from the given json data key.
    var columns = [];
    var headerTr$ = $('<tr/>');

    for (var i = 0; i < myList.length; i++) {
        var rowHash = myList[i];
        for (var key in rowHash) {
            if ($.inArray(key, columns) == -1) {
                columns.push(key);
                headerTr$.append($('<td class = "innerTableData"/>').html(key));
            }
        }
    }
    $("#excelDataTable").append(headerTr$);

    //this for loop will create the row data for the html table from the given json data.
    for (var i = 0; i < myList.length; i++) {
        var row$ = $('<tr/>');
        for (var colIndex = 0; colIndex < columns.length; colIndex++) {
            var cellValue = myList[i][columns[colIndex]];

            if (cellValue == null) {
                cellValue = "";
            }

            row$.append($('<td/>').html(cellValue));
        }
        $("#excelDataTable").append(row$);
    }

    //here we are adding the html file of the table and get the values then convert it to ms-excel formate.
    let file = new Blob([html.outerHTML], {
        type: "application/vnd.ms-excel"
    });
    let url = URL.createObjectURL(file);

    //this is the file name after downloading the excel file.
    //you can change the text which is here "downloadedfile" 
    //Note one thing dont remove the second part of this string ".xls" 
    //other wise the file downloaded can not work.
    var filename = "downloadedfile" + ".xls"

    //here we are creating HTML <a> Tag which can be trigger to download the excel file.
    var a = document.createElement('a');
    a.id = "export";

    document.body.appendChild(a);

    //here we are checking if the bwoswer is IE or not if IE then we use window.navigator.msSaveBlob function otherwise 
    //Go with Simple Blob file.
    if (window.navigator && window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(file, filename);
        a.click();
        document.body.removeChild(a);
        document.body.removeChild(html);
    } else {
        a.download = filename;
        a.href = url;
        a.click();
        document.body.removeChild(a);
        document.body.removeChild(html);
    }



}