function setUpFilterConstants() {
    window.allElementsHiddenByFilters = window.cy.collection(); //elements (nodes + edges) that have been (collectively) hiden by active filters
    window.filteredElementsMap = {
        //key=property to filter on, value=all elements (in the original graph) that are captured by the filter
        'node probability': cy.collection(),
        'edge weight': cy.collection(),
        'department': cy.collection()
    };
}

function filterOnNodeProperty(allNodesCapturedByFilter, property) {
    let visibleElements = cy.$(':visible');
    // console.log('visibleNodes', visibleNodes.size());
    let allEdgesRelatedToCapturedNodes = allNodesCapturedByFilter.connectedEdges();
    let allElementsCapturedByFilter = allNodesCapturedByFilter.union(allEdgesRelatedToCapturedNodes);
    // console.log('allElementsCapturedByFilter', allElementsCapturedByFilter.size());
    window.filteredElementsMap[property] = allElementsCapturedByFilter;

    let elementsToRestore = window.allElementsHiddenByFilters;
    for (filterType in window.filteredElementsMap) {
        elementsToRestore = elementsToRestore.difference(window.filteredElementsMap[filterType]);
    }

    let elementsToRemove = visibleElements.intersection(allElementsCapturedByFilter);
    // console.log('nodesToRemove', nodesToRemove.size());
    elementsToRestore.removeClass('notDisplayed');
    // console.log('elementsToRestore', elementsToRestore.size());
    elementsToRemove.addClass('notDisplayed');
    
    window.allElementsHiddenByFilters = cy.$(':hidden');
}

function filterDepartments() {
    // console.log('-- filter departments --');
    let departmentsTagged = $("#department-names-field").val();
    // console.log(departmentsTagged);
    let nodesCapturedByFilter = cy.nodes().filter(function (ele) {
        // console.log(ele.data('department'));
        return !departmentsTagged.includes(ele.data('department'));
    });;
    // console.log('nodesCapturedByFilter', nodesCapturedByFilter.size());
    // console.log(nodesCapturedByFilter.json());
    filterOnNodeProperty(nodesCapturedByFilter, 'department');
}

function filterNodeProbability() {
    // console.log('-- filter node prob --');
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

    let nodesCapturedByFilter = cy.elements('node[p < ' + from + '], node[p > ' + to + ']');
    // console.log('nodesCapturedByFilter', nodesCapturedByFilter.size());
    // console.log(nodesCapturedByFilter.json());
    filterOnNodeProperty(nodesCapturedByFilter, 'node probability');
}

function filterOnEdgeProperty(allEdgesCapturedByFilter, property) {
    let visibleEdges = cy.edges(':visible');
    window.filteredElementsMap[property] = allEdgesCapturedByFilter;

    let edgesToRestore = window.allElementsHiddenByFilters.intersection(cy.edges());
    for (filterType in window.filteredElementsMap) {
        edgesToRestore = edgesToRestore.difference(window.filteredElementsMap[filterType]);
    }

    let edgesToRemove = visibleEdges.intersection(allEdgesCapturedByFilter);
    edgesToRestore.removeClass('notDisplayed');
    edgesToRemove.addClass('notDisplayed');
    
    window.allElementsHiddenByFilters = cy.$(':hidden');
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
    
    let allEdgesCapturedByFilter = cy.elements('edge[weight < ' + from + '], edge[weight > ' + to + ']');
    filterOnEdgeProperty(allEdgesCapturedByFilter, 'edge weight');
}

function resetAllFilters() {
    //make all elements visible again
    window.allElementsHiddenByFilters.removeClass('notDisplayed');

    //reset input forms
    document.getElementById('node-prob-input-lowerbound').val = 0;
    document.getElementById('node-prob-input-upperbound').val = 1;
    document.getElementById('edge-weight-input-lowerbound').val = 0;
    document.getElementById('edge-weight-input-upperbound').val = 1;
    initializeDepartmentTags();
}

/* Manage multi-tag select for department filtering */
function setDepartmentTagsTypeahead() {
    $('#department-names-field').tagsinput({
        typeahead: {
          source: window.departments
        },
        freeInput: false
    });
    initializeDepartmentTags();
}

function initializeDepartmentTags() {
    window.departments.forEach(dept => {
        $('#department-names-field').tagsinput('add', dept);
    });
}