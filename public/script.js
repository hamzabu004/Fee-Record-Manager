function onlyNumberKey(evt) {
    // Only ASCII character in that range allowed
    var ASCIICode = (evt.which) ? evt.which : evt.keyCode
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
    return true;
}

function generatePDF() {
    console.log("Generating PDF...");


    window.jsPDF = window.jspdf.jsPDF;
    window.html2canvas = html2canvas

    var pdf = new jsPDF('l', 'pt', 'a4', true);
 
    
    var table = document.getElementById('main-data'),
    rows = table.rows;
    var i = 1; 
    for (var j = 1; j < rows.length-1; j++) {
        // Deleting the ith cell of each row.
        rows[j].deleteCell(i);
    }
    document.getElementById("table-title").colSpan = "17";
    document.getElementById("grnd-title").colSpan = "4";
    
    
    let clas = document.getElementById('clas').innerHTML;
    pdf.text(50, 30, "Class: " + clas);
    let colStyle = {
        1: { cellWidth: 70 },
        2: { cellWidth: 30 },
        3: {cellWidth: 30  },
        17: { cellWidth: 80 }, 
    }
    let styles = {
        cellWidth: 'auto', 
        halign: 'center',  
        fontSize: 8 
    }
    let optionsAutotable = {
        html:"#main-data",
        columnStyles: colStyle, 
        theme: 'grid', 
        startY: 50, 
        styles: styles 
    }
    pdf.autoTable(optionsAutotable)
    pdf.save('table.pdf')
    location.reload()
}

$(document).ready(function () {
    $('#change-btn').prop('disabled', true);
    $("#a-new-pass").on('input', function (e) {
        let input2 = $("#new-pass").val();
        let input1 = this.value;
        // let input = $('input[name=new_pass]').val();
        console.log(input1);
        console.log(input2);
        if (input1 === input2) {
            $('#change-btn').prop('disabled', false);
            $('#status').html('');
        } else {
            $('#change-btn').prop('disabled', true);
            $('#status').html('Passwords does not match');
        }
    })
    $("#new-pass").on('input', function (e) {
        let input2 = $("#a_new-pass").val();
        let input1 = this.value;
        if (input1 === input2) {
            $('#change-btn').prop('disabled', false);
            $('#status').html('');
        } else {
            $('#change-btn').prop('disabled', true);
            $('#status').html('Passwords does not match');
        }
    })
    $('#logout-btn').on('click', function () {
        $('#logout-form').submit();
    });
    $('#print-btn').click(function () {
        console.log('Printing');
        generatePDF();
        $("#main-data").children(".A").remove();
    })
})