function setUpNodeConstants() {
    window.maxNodeWidth = 50;
}
function styleNodesByCluster() {
    cy.style().selector(':child').style({
        'background-color': function (ele) {
            return window.departmentsClusterColors[ele.data('department')];
        },
        'background-opacity': function (ele) {
            return 1;//ele.data('p')*10;
        },
        'border-width': 3,
        'border-color': 'black',
        'width': function (ele) {
            return Math.max(30, maxNodeWidth * (1-1/(1+ele.data('p'))));
        },
        'height': function (ele) {
            return Math.max(30, maxNodeWidth * (1-1/(1+ele.data('p'))));
        },
        'label': 'data(name)',
        'text-background-shape': 'roundrectangle',
        'text-background-color': 'white',
        'text-background-opacity': 1,
        'text-background-padding': '1px',
        'font-size': '8pt',
        'text-halign': 'center',
        'text-valign': 'center'
    }).update();

    /* hide visibility of parent nodes --
     * -- note that using the visibility attribute would hide the entire compound node, including children nodes */
    cy.style().selector(':parent').style({
        'background-opacity' : 0,
        'border-width': 0
    }).update();
}