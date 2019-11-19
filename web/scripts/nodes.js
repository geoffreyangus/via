function setUpNodeConstants() {
    window.maxNodeWidth = 50;
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

