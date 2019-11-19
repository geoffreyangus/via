function styleEdges() {
    cy.style().selector('edge').style({
        'width': 'data(width)',
        'line-color': 'data(color)',
        'opacity': 'data(weight)',
        'target-arrow-color': 'data(color)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
    }).update()
}

function mapEdgeStylesToData() {
    
}