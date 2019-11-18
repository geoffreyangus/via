function setUpFilterConstants() {
    window.nodesRemovedByDepartmentFilter = window.cy.collection();
    window.filteredElementsMap = {
        'node probability': cy.collection(),
        'edge weight': cy.collection()
    };
}

function removeDepartments() {
    window.nodesRemovedByDepartmentFilter.restore();
    let depts = $("#department-names-field").val();
    if (depts) {
        window.nodesRemovedByDepartmentFilter = cy.nodes().filter(function (ele) {
            return depts.includes(ele.data('department'));
        }).remove();
    }
}

function resetDepartmentFilter() {
    window.nodesRemovedByDepartmentFilter.restore();
    window.nodesRemovedByDepartmentFilter = cy.collection();
    $("#department-names-field").tagsinput('removeAll');
}

function setDepartmentTagsTypeahead() {
    $('#department-names-field').tagsinput({
        typeahead: {
          source: window.departments
        }
    });
}


function filterNodeProbability() {
    let lowerboundInput = document.getElementById('node-prob-input-lowerbound');
    let upperboundInput = document.getElementById('node-prob-input-upperbound');

    let from = lowerboundInput.value != null ? lowerboundInput.value : lowerboundInput.defaultValue;
    if (from < 0.0 || from > 1.0) {
        lowerboundInput.value = 0;
    }
    let to = upperboundInput.value != null ? upperboundInput.value : upperboundInput.defaultValue;
    if (to < 0.0 || to > 1.0) {
        to = upperboundInput.value = 1;
    }
    if (from > to) {
        return; // error in range
    }

    let currShownNodes = cy.nodes(':inside');
    let currRemovedElements = window.filteredElementsMap['node probability'];
    
    let allNodesExcludedByFilter = cy.elements('node[p < ' + from + '], node[p > ' + to + ']')
    let allNodesCapturedByFilter = cy.nodes().difference(allNodesExcludedByFilter);
    let allEdgesRelatedToCapturedNodes = allNodesCapturedByFilter.connectedEdges();
    let allElementsCapturedByFilter = allNodesCapturedByFilter.union(allEdgesRelatedToCapturedNodes);

    let elementsToRestore = currRemovedElements.difference(allElementsCapturedByFilter);
    let nodesToRemove = currShownNodes.intersection(allNodesExcludedByFilter);

    /* remove nodes (and their edges) outside the filtered range,
     restore nodes (and their edges) inside the filtered range,
     and keep track removed elements due to this filter */
     
    elementsToRestore.restore();
    currRemovedElements = currRemovedElements.difference(elementsToRestore);
    currRemovedElements = currRemovedElements.union(cy.remove(nodesToRemove));
    window.filteredElementsMap['node probability'] = currRemovedElements;
}

function filterEdgeWeight() {
    let lowerboundInput = document.getElementById('edge-weight-input-lowerbound');
    let upperboundInput = document.getElementById('edge-weight-input-upperbound');

    let from = lowerboundInput.value != null ? lowerboundInput.value : lowerboundInput.defaultValue;
    if (from < 0.0 || from > 1.0) {
        lowerboundInput.value = 0;
    }
    let to = upperboundInput.value != null ? upperboundInput.value : upperboundInput.defaultValue;
    if (to < 0.0 || to > 1.0) {
        to = upperboundInput.value = 1;
    }
    if (from > to) {
        return; // error in range
    }

    let currShownEdges = cy.edges(':inside');
    let currRemovedEdges = window.filteredElementsMap['edge weight'];
    
    let allEdgesExcludedByFilter = cy.elements('edge[weight < ' + from + '], edge[weight > ' + to + ']')
    let allEdgesCapturedByFilter = cy.edges().difference(allEdgesExcludedByFilter);

    let edgesToRestore = currRemovedEdges.intersection(allEdgesCapturedByFilter);
    let edgesToRemove = currShownEdges.intersection(allEdgesExcludedByFilter);

    /* remove edges outside the filtered range,
     restore edges inside the filtered range,
     and keep track removed edges due to this filter */
     
    edgesToRestore.restore();
    currRemovedEdges = currRemovedEdges.difference(edgesToRestore);
    currRemovedEdges = currRemovedEdges.union(cy.remove(edgesToRemove));
    window.filteredElementsMap['edge weight'] = currRemovedEdges;
}
