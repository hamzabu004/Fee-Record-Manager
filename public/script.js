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

    var pdf = new jsPDF('p', 'pt', 'a4');
    pdf.html(document.getElementById("main-data"), {
        callback: function(doc) {
            // Save the PDF
            doc.save('sample-document.pdf');
        }
    
    });
   }

$(document).ready(function() {
    $('#change-btn').prop('disabled', true);
    $("#a-new-pass").on('input' ,function(e) {
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
    $("#new-pass").on('input' ,function(e) {
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
    $('#logout-btn').on('click', function() {
        $('#logout-form').submit();
    });
    $('#print-btn').click(function() {
            console.log('Printing');
        generatePDF();
    })
})