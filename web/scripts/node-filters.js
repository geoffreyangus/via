function setUpFilterConstants() {
    window.nodesRemovedByDepartmentFilter = window.cy.collection();
    window.collectionRemovedByLinkDirectionFilter = window.cy.collection();
    
}

function filter() {
    window.nodesRemovedByDepartmentFilter.restore();
    let depts = $("#department-names-field").val();
    if (depts) {
        window.nodesRemovedByDepartmentFilter = cy.nodes().filter(function (ele) {
            return depts.includes(ele.data('department'));
        }).remove();
    }
}

function clearFilters() {
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
