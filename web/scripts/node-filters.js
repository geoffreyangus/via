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
    console.log('-----');
    let currShownNodes = cy.nodes(':inside');
    console.log('currShownNodes', currShownNodes.size());
    let currRemovedElements = window.filteredElementsMap['node probability'];
    console.log('currRemovedElements', currRemovedElements.size());
    
    let allNodesExcludedByFilter = cy.elements('node[p < ' + from + '], node[p > ' + to + ']')
    console.log('allNodesExcludedByFilter', allNodesExcludedByFilter.size());
    let allNodesCapturedByFilter = cy.nodes().difference(allNodesExcludedByFilter);
    console.log('allNodesCapturedByFilter', allNodesCapturedByFilter.size());
    let allEdgesRelatedToCapturedNodes = allNodesCapturedByFilter.connectedEdges();
    console.log('allEdgesRelatedToCapturedNodes', allEdgesRelatedToCapturedNodes.size());
    let allElementsCapturedByFilter = allNodesCapturedByFilter.union(allEdgesRelatedToCapturedNodes);
    console.log('allElementsCapturedByFilter', allElementsCapturedByFilter.size());

    let elementsToRestore = currRemovedElements.intersection(allElementsCapturedByFilter);
    console.log('elementsToRestore', elementsToRestore.size());
    let nodesToRemove = currShownNodes.intersection(allNodesExcludedByFilter);
    console.log('nodesToRemove', nodesToRemove.size());

    /* remove nodes (and their edges) outside the filtered range,
     restore nodes (and their edges) inside the filtered range,
     and keep track removed elements due to this filter */
     
    // elementsToRestore.restore();
    elementsToRestore.removeClass('notDisplayed');
    currRemovedElements = currRemovedElements.difference(elementsToRestore);
    // currRemovedElements = currRemovedElements.union(cy.remove(nodesToRemove));
    nodesToRemove.addClass('notDisplayed');
    currRemovedElements = currRemovedElements.union(nodesToRemove);

    window.filteredElementsMap['node probability'] = currRemovedElements;
}
