function computeDegreeFunction() {
    window.allElementsHiddenByFilters.remove();
    let degreeFxnSelector = document.getElementById("degree-fxn-selector");
    let degreeFxn = degreeFxnSelector.options[degreeFxnSelector.selectedIndex].value;
    let nodesAndDegrees = [];
    switch(degreeFxn) {
        case 'in-degree':
            window.cy.nodes().forEach(node => {
                if (node.isChild() || node.hasClass('cy-expand-collapse-collapsed-node')) {
                    nodesAndDegrees.push([node.data('name'), node.indegree(false), node]);
                }
            });
            break
        case 'out-degree':
            window.cy.nodes().forEach(node => {
                if (node.isChild() || node.hasClass('cy-expand-collapse-collapsed-node')) {
                    nodesAndDegrees.push([node.data('name'), node.outdegree(false), node]);
                }
            });
            break
        case 'degree':
            window.cy.nodes().forEach(node => {
                if (node.isChild() || node.hasClass('cy-expand-collapse-collapsed-node')) {
                    nodesAndDegrees.push([node.data('name'), node.degree(false), node]);
                }
            });
            break
    }
    window.allElementsHiddenByFilters.restore();
    showResultsInPopup(nodesAndDegrees, degreeFxn);
    updateNodeData(nodesAndDegrees, degreeFxn).then(() => addQTip());
}

function showResultsInPopup(nodesAndDegrees, degreeFxn) {
    document.getElementById('modal-title').innerHTML = "Results - " + degreeFxn + "";
    let results = [];
    nodesAndDegrees.forEach(item => {
        let courseName = item[0];
        let degreeValue = item[1];
        results.push("(" + courseName + ", " + degreeValue + ")");
    });
    results = results.join(', ');
    document.getElementById('modal-log').innerHTML = results;
    document.getElementById('modal-log').value = results;
}

function updateNodeData(nodesAndDegrees, degreeFxn) {
    return new Promise((resolve, reject) => {
        nodesAndDegrees.forEach(item => {
            let degreeValue = item[1];
            let node = item[2];
            node.data(degreeFxn, degreeValue)
        });
        resolve();
    });
}