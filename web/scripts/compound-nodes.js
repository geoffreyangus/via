function setUpCompoundNodes() {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < window.departments.length; i++) {
            let dept = window.departments[i];
            let p_id = '!special_' + i;
            // add new parent node for department
            cy.add({
                group : "nodes",
                data: {
                    id: p_id,
                    name: "compound_" + dept,
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
    let deptChildren = cy.nodes().filter(function (ele) {
        return ele.data('department') === dept && !ele.isParent();
    });
    return deptChildren
}

function getBoundingBoxes1() {
    let rect = document.getElementById('cy').getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left);
    let nCols = 5;
    let box_width = cy.width() / nCols;
    let boundsMultiplier = box_width / window.maxClusterSize;
    let nRows = window.numDepartments / nCols;
    if (window.numDepartments % nCols != 0) {
        nRows += 1;
    }

    let boxes = [];
    
    for (let y = 0; y < nRows; y++) {
        for (let x = 0; x < nCols; x++) {
            boxes.push({
                x1: rect.left + x * box_width, 
                y1: rect.top + y * box_width,
                w: box_width,
                h: box_width
            });
        }
    }
    return boxes;
}