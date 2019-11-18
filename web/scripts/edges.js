function styleEdges() {
    var edgeColor = function(ele) {
        sourceNode = cy.nodes('[id=\"' + ele.data('source') + '\"]');
        sourceDept = sourceNode.data('department');
        targetNode = cy.nodes('[id=\"' + ele.data('target') + '\"]');
        targetDept = targetNode.data('department');
        if (sourceDept === targetDept) {
            return window.departmentsClusterColors[sourceDept];
        }
        return 'white';
    };

    var edgeWidth = function(ele) {
        sourceNode = cy.nodes('[id=\"' + ele.data('source') + '\"]');
        sourceDept = sourceNode.data('department');
        targetNode = cy.nodes('[id=\"' + ele.data('target') + '\"]');
        targetDept = targetNode.data('department');
        if (sourceDept === targetDept) {
            return 4;
        }
        return 2;
    }
    
    cy.style().selector('edge').style({
        'width': edgeWidth,
        'line-color': edgeColor,
        'opacity': function(ele) {
            return Math.min(0.3,ele.data('weight'));
        },
        'target-arrow-color': edgeColor,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
    })
    .selector('edge.highlighted').style({
        'color': 'red'
    }).update();

    cy.style().selector('edge.notDisplayed').style({
        'display': 'none'
    }).update();
}