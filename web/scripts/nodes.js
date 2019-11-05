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

    cy.style().selector('node.highlighted').style({
        'border-color': 'red'
    }).update();

    /* hide visibility of parent nodes --
     * -- note that using the visibility attribute would hide the entire compound node, including children nodes */
    // cy.style().selector(':parent').style({
    //     'background-opacity' : 0,
    //     'border-width': 0
    // }).update();
}

// function listenBoxSelection() {
//     cy.on('box', 'node', function(event) {
//        selectNodes(cy.nodes(':selected'));
//     });
//     cy.on('tap', function(event){
//         let target = event.target;
//         if (target === cy) clearSelectedNodes();
//     });
//     cy.on('tap', 'node', function(evt){
//         let node = evt.target;
//         clearSelectedNodes();
//         selectNodes(node);
//     });
// }

// function clearSelectedNodes() {
//     window.selectedNodes.forEach(node => {
//         node.style({
//             'border-color':'black'
//         })
//     });
//     window.selectedNodes = cy.collection();
// }

// function selectNodes(eles) {
//     window.selectedNodes = eles;
//     window.selectedNodes.style({
//         'border-color': 'yellow'
//     });
// }

function listenSelection() {
    cy.$('node').on('grab', function (e) {
        var ele = e.target;
        ele.addClass('highlighted');
    });
    
    cy.$('node').on('free', function (e) {
        var ele = e.target;
        ele.removeClass('highlighted');
    });

    cy.on('boxselect', 'node', function() {
        cy.nodes(':selected').addClass('highlighted');
    })
}