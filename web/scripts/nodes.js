function setUpNodeConstants() {
    window.maxNodeWidth = 50;
    window.minNodeWidth = 30;
    // window.selectedNodes = cy.collection();
}
function styleNodesByCluster() {
    cy.style().selector('node').style({
        'background-color': function (ele) {
            return window.departmentsClusterColors[ele.data('department')];
        },
        'background-opacity': function (ele) {
            return 1;
        },
        'border-width': 1,
        'border-color': 'white',
        'width': function (ele) {
            return (window.minNodeWidth + window.maxNodeWidth * ele.data('p'));
        },
        'height': function (ele) {
            return (window.minNodeWidth + window.maxNodeWidth * ele.data('p'));
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

    cy.style().selector('node.highlighted').style({
        'border-color': '#5bc0de',
        'border-width': 3,
        'background-color': 'yellow'
    }).update();
}

function listenSelection() {
    cy.nodes().on('select', function() {
        cy.nodes(':selected').addClass('highlighted');
    })

    cy.nodes().on('unselect', function(ele) {
        cy.nodes().removeClass('highlighted')
        cy.nodes(':selected').addClass('highlighted');
    })
}

