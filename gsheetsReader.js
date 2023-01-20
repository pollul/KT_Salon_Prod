
const sheetID = '1NUt36vkRrYxYPRjzqg3JZXIMD552wA78BvV4lID2Nz4';
document.addEventListener('DOMContentLoaded',loadGSheetData(sheetID,'output'));

$(document).ready(function() {
    // Read the data from the Google Sheets document and display it in the table
    readSheet();
  });

function loadGSheetData(sheetID,elementID){
    const base = 'https://docs.google.com/spreadsheets/d/'+sheetID+'/gviz/tq?';
    const sheetName = 'Services';
    const query = encodeURIComponent('Select *');
    const url = base+'&sheet='+sheetName+'&tq='+query;
    parseGSData(url,elementID)
}

function parseGSData(url,elementID){
    console.log('ready');
    let data = [];
    fetch(url)
    .then(res => res.text())
    .then(rep => {
        //console.log(rep);
        const jsData = JSON.parse(rep.substr(47).slice(0,-2));
        //console.log(jsData);
        const colz = [];
        jsData.table.cols.forEach((heading)=>{
            if(heading.label) {
            colz.push(heading.label.toLowerCase().replace(/\s/g,''));
            }
        });
        jsData.table.rows.forEach((main)=>{
            //console.log(main);
            const row = {};
            colz.forEach((ele,ind)=>{
                //console.log(ele);/*  */
                row[ele] = (main.c[ind] != null) ? main.c[ind].v : '';
            })
            //console.log(row);
            data.push(row);
            
        });
        

        //appendGSDataToTable(data,elementID);
        appendGSDataToAccordion(data,elementID);
         
    }) 
}


function appendGSDataToAccordion(data, elementID){
    let output = document.querySelector("."+elementID);
    var htmlElement = '';
    let currentServiceType = '';
    let currentServiceCat = '';
    //htmlElement += '<div class="accordion" id="accordionExampleY">';
    for(let thing in data) {
        //console.log(data[thing].se);
        let currentDataType = data[thing].type.split(' ').join('_');
        if(currentServiceType == data[thing].type){
            if(data[thing].category != currentServiceCat){
                currentServiceCat = data[thing].category; 
                htmlElement += '<tr><td colspan="4"><h1>'+ data[thing].category +'</h1></td></tr>';
            }
            htmlElement += '<tr>';
            htmlElement += '<td><b>' + data[thing].service + '</b></td>';
            htmlElement += '<td>$' + data[thing].price + '</td>';
            htmlElement += '<td>' + data[thing].servicetime + ' minutes</td>';
            //htmlElement += '<td>' + '<button class="btn btn-primary">Schedule</button>' + '</td>';
            htmlElement += '</tr>';
        }else{
            htmlElement += '</table></div></div></div>';
            currentServiceType = data[thing].type;
            
            htmlElement += '<div class="accordion-item">';
            htmlElement += '<h1" class="accordion-header" id="heading'+currentDataType+'">'+
            '<button class="text-center accordion-button" type="button" data-mdb-toggle="collapse"'+
            'data-mdb-target="#collapse'+currentDataType+'" aria-expanded="true" aria-controls="collapse'+data[thing].type+'">' +
            '<h1>'+data[thing].type +'</h2></button></h2>';
            htmlElement += '<div id="collapse'+currentDataType+'" class="accordion-collapse collapse" aria-labelledby="heading'+data[thing].type+'"'+
            'data-mdb-parent="#accordionExampleY">'+
            '<div class="accordion-body"><table class="table table-hover">';
            if(data[thing].category != currentServiceCat){
                currentServiceCat = data[thing].category; 
                htmlElement += '<tr><td colspan="4"><h2>'+ data[thing].category +'</h2></td></tr>';
            }
            htmlElement += '<tr>';
            htmlElement += '<td><b>' + data[thing].service + '</b></td>';
            htmlElement += '<td>$' + data[thing].price + '</td>';
            htmlElement += '<td>' + data[thing].servicetime + ' minutes</td>';
            //htmlElement += '<td>' + '<button class="btn btn-primary">Schedule</button>' + '</td>';
            htmlElement += '</tr>';
        }
    }
    //htmlElement += '</table>';
    output.innerHTML = htmlElement;
}


function appendGSDataToTable(data, elementID){
    let output = document.querySelector("."+elementID);

    var htmlElement = '';
    let currentServiceType = '';
    let currentServiceCat = '';
    htmlElement += '<table>';
    for(let thing in data) {
        //console.log(data[thing].category);
        if(currentServiceType == data[thing].type){
            if(data[thing].category != currentServiceCat){
            currentServiceCat = data[thing].category; 
            htmlElement += '<tr><td colspan="2"><h2>'+ data[thing].category +'</h2></td></tr>';
            }
            htmlElement += '<tr>';
            htmlElement += '<td>' + data[thing].service + '</td>';
            htmlElement += '<td>$' + data[thing].price + '</td>';
            htmlElement += '</tr>';
        }else{
            currentServiceType = data[thing].type;
            htmlElement += '</table>';
            //htmlElement += '<h1>'+data[thing].type+'</h1>';
            htmlElement += '<div class="text-center"><h1>' + data[thing].type + '</h1></div>';
            htmlElement += '<table class="table table-sm table-hover">';
            if(data[thing].category != currentServiceCat){
            currentServiceCat = data[thing].category; 
            htmlElement += '<tr href="www.google.com"><td colspan="2"><h2>'+ data[thing].category +'</h2></td></tr>';
            }
            htmlElement += '<tr>';
            htmlElement += '<td>' + data[thing].service + '</td>';
            htmlElement += '<td>$' + data[thing].price + '</td>';
            htmlElement += '<td>' + '<button class="btn btn-primary">Buy</button>' + '</td>';
            htmlElement += '</tr>';
        }
    }
    output.innerHTML = htmlElement;
}

function readSheet() {
    // Send the Ajax request to the Google Sheets API
    $.ajax({
      url: "https://sheets.googleapis.com/v4/spreadsheets/1NUt36vkRrYxYPRjzqg3JZXIMD552wA78BvV4lID2Nz4/values/A:E",
      type: "GET",
      dataType: "json"
    }).done(function(response) {
      // Loop through the rows in the response
      response.values.forEach(function(row) {
        // Append the row to the table
        $("#myTable").append(
          "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td><td>" + row[2] + "</td><td>" + row[3] + "</td><td>" + row[4] + "</td></tr>"
        );
      });
      console.log(response.values);
    });
  }