function CreatePDF(imageUrl) {

    // create BytescoutPDF object instance
    var pdf = new BytescoutPDF();

    // set document properties: Title, subject, keywords, author name and creator name
    pdf.propertiesSet("Sample document title", "Sample subject", "keyword1, keyword 2, keyword3", "Document Author Name", "Document Creator Name");

    // set page size
    pdf.pageSetSize(BytescoutPDF.Letter);
    // set page orientation
    pdf.pageSetOrientation(true);

    // add new page
    pdf.pageAdd();

    pdf.fontSetName('Helvetica');
    pdf.fontSetStyle(false, false, false);

    for (var i = 0; i < 5; i++) {
        pdf.fontSetSize(10 + i * 4);
        pdf.textAdd(20 + 70 * i, 20, 'hola');
    }

    pdf.fontSetStyle(false, true, true);
    pdf.textAdd(50, 50, 'hello');
    pdf.fontSetStyle(true, true, true);
    pdf.textAdd(250, 50, 'hello');

    pdf.pageSetOrientation(false);
    pdf.pageAdd();

    pdf.fontSetName('Times-Roman');
    pdf.textAdd(20, 70, 'hello');
    pdf.fontSetStyle(true, false, true);
    pdf.textAdd(100, 70, 'hello');
    pdf.fontSetStyle(false, true, true);
    pdf.textAdd(190, 70, 'hello');
    pdf.fontSetStyle(true, true, true);
    pdf.textAdd(280, 70, 'hello');

    pdf.fontSetName('Courier');
    pdf.textAdd(20, 90, 'hello');
    pdf.fontSetStyle(true, false, false);
    pdf.textAdd(100, 90, 'hello');
    pdf.fontSetStyle(false, true, false);
    pdf.textAdd(190, 90, 'hello');
    pdf.fontSetStyle(true, true, true);
    pdf.textAdd(280, 90, 'hello');

    for (var j = 0; j < 50; j++) {
        pdf.graphicsSetColor(j * 5, 0, 250 - j * 5);
        pdf.graphicsSetLineWidth(1 + j / 25);
        pdf.graphicsDrawLine(20, 120 + j * 4, 120, 120 + j * 4);
    }

    pdf.textAdd(200, 150, 'hello');

    pdf.pageSetOrientation(true);
    pdf.pageAdd();

    pdf.imageLoadFromUrl(imageUrl);
    pdf.imagePlace(20, 40);

    // pdf.imageLoadFromUrl('image2.jpg');
    // pdf.imagePlace(120, 220);

    // return BytescoutPDF object instance
    return pdf;
}