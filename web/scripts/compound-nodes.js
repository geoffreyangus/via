function setUpCompoundNodes() {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < window.departments.length; i++) {
            let dept = window.departments[i];
            let p_id = 'supernode_' + dept;
            // add new parent node for department
            cy.add({
                group : "nodes",
                data: {
                    id: p_id,
                    name: dept + " (supernode)",
                    p: 0,
                    department: dept,
                }
            });
            cy.nodes('[department=\"' + dept + '\"]').move({parent: p_id});
        }
        resolve();
    })
}

function getChildren() {
    return cy.nodes(':child');
}

function getParents() {
    return cy.nodes(':parent');
}

function getChildNodesInDepartment(dept) {
    let deptChildren = cy.nodes(':child').filter(function (ele) {
        return ele.data('department') === dept;
    });
    return deptChildren;
}