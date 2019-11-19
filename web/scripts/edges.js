function styleEdges() {
    cy.style().selector('edge').style({
        'width': 'data(width)',
        'line-color': 'data(color)',
        'opacity': function(ele) {
            return Math.min(0.3,ele.data('weight'));
        },
        // 'opacity': 'mapData(weight, 0, 100, 0, 0.3)',
        'target-arrow-color': 'data(color)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
    }).update()
}

function mapEdgeStylesToData() {
    
}