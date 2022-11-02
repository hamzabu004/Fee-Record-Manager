function onlyNumberKey(evt) {
    // Only ASCII character in that range allowed
    var ASCIICode = (evt.which) ? evt.which : evt.keyCode
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
    return true;
}

function generatePDF() {
    console.log("Generating PDF...");
    // html2pdf().set({
    //     pagebreak: { mode: 'avoid-all', after: '#page2el' }

    // });
    // var element = document.getElementById('main-data');
    // var opt = {
    //     margin: 0,
    //     filename: 'myfile.pdf',
    //     image: { type: 'jpeg', quality: 1 },
    //     html2canvas: { scale: 1},
    //     jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
    // };

    // // New Promise-based usage:
    // html2pdf().set(opt).from(element).save();


    window.jsPDF = window.jspdf.jsPDF;
    window.html2canvas = html2canvas

    var pdf = new jsPDF('l', 'pt', 'a4', true);
    // pdf.html(document.getElementById("main-data"), {
    //     scalewidth: 0.5,
    //     callback: function(doc) {
    //         // Save the PDF
    //         doc.save('sample-document.pdf');
    //     },
    //     windowWidth: 620,
    //     x: 20,
    //     y: 20,
    //     width: 470
    // });
    let clas = document.getElementById('clas').innerHTML;
    pdf.text(50, 30, "Class: " + clas);
    let colStyle = {
        1: { columnWidth: 0 },
        2: { columnWidth: 80 },
        3: { columnWidth: 50 },
        17: { columnWidth: 80 }, 
    }
    pdf.autoTable({ html: '#main-data', columnStyles: colStyle, theme: 'grid', startY: 50,margin: 0, styles: { cellWidth: 'auto', halign: 'center' } })
    pdf.save('table.pdf')
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