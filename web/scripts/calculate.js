function computeDegreeFunction() {
    window.allElementsHiddenByFilters.remove();
    let degreeFxnSelector = document.getElementById("degree-fxn-selector");
    let degreeFxn = degreeFxnSelector.options[degreeFxnSelector.selectedIndex].value;
    let nodesAndDegrees = [];
    switch(degreeFxn) {
        case 'in degree':
            window.cy.nodes().forEach(node => {
                if (node.isChild() || node.hasClass('cy-expand-collapse-collapsed-node')) {
                    nodesAndDegrees.push({
                        'course: ': node.data('name'),
                        'in degree: ': node.indegree(false)
                    });
                }
            });
            break
        case 'out degree':
            window.cy.nodes().forEach(node => {
                if (node.isChild() || node.hasClass('cy-expand-collapse-collapsed-node')) {
                    nodesAndDegrees.push([node.data('name'), node.outdegree(false)]);
                }
            });
            break
        case 'degree':
            window.cy.nodes().forEach(node => {
                if (node.isChild() || node.hasClass('cy-expand-collapse-collapsed-node')) {
                    nodesAndDegrees.push([node.data('name'), node.degree(false)]);
                }
            });
            break
    }
    window.allElementsHiddenByFilters.restore();
    showResultsInPopup(nodesAndDegrees, degreeFxn);
}

function showResultsInPopup(nodesAndDegrees, degreeFxn) {
    document.getElementById('#modal-title').innerHTML = "Results - " + degreeFxn + "";
    let results = [];
    nodesAndDegrees.forEach(item => {
        courseName = item[0];
        degree = item[1];
        results.push("(" + courseName + ", " + degree + ")");
    });

    document.getElementById('#modal-log').innerHTML = results.join(', ');
}