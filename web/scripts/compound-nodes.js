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

function getNodesInDepartment(dept) {
    let deptChildren = cy.nodes().filter(function (ele) {
        return ele.data('department') === dept;
    });
    return deptChildren
}

function getBoundingBoxes1() {
    let rect = document.getElementById('cy').getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left);
    let nCols = 6;
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

function getBoundingBoxes3() {
    let rect = document.getElementById('cy').getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left);
    let nCols = 10;
    let box_width = cy.width() * 2/ nCols;
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

function getBoundingBoxes2() {
    let rect = document.getElementById('cy').getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left);
    let nCols = Math.ceil(Math.sqrt(window.numDepartments));
    let box_width = cy.width() * 10 / nCols;
    let boundsMultiplier = box_width / window.maxClusterSize;
    let nRows = window.numDepartments / nCols;
    if (window.numDepartments % nCols != 0) {
        nRows += 1;
    }

    let boxes = [];
    
    for (let y = 0; y < nRows; y++) {
        for (let x = 0; x < nCols; x++) {
            boxes.push({
                x1: rect.left + 2* x * box_width, 
                y1: rect.top + 2* y * box_width,
                w: box_width,
                h: box_width
            });
        }
    }
    return boxes;
}

function getEstimatedClusterWidth(dept) {
    let epsilon = 0.5;
    let circumference = window.departmentsClusterSizes[dept] * window.maxNodeWidth;
    let diameter = Math.max(window.maxNodeWidth, circumference / Math.PI); //account for cases where cluster has one node
    return (1+epsilon) * diameter;
}

function getClustersAndWidths() {
    let clustersAndWidths = []
    window.departments.forEach(dept => {
        clustersAndWidths.push({department: dept, width: getEstimatedClusterWidth(dept)});
    });
    return clustersAndWidths;
}

function computeBoundingBoxesForClusters() {
    let marginEpsilon = 0.2;
    window.departmentToBoundingBoxesMap = new Object();
    let nCols = Math.ceil(Math.sqrt(window.numDepartments));
    let i = 0;
    let x = 0;
    let y = 0;
    let clustersAndWidths = getClustersAndWidths();
    while (i < window.numDepartments) {
        let currentRow = clustersAndWidths.slice(i, i+nCols);
        let maxBoxWidthInRow = currentRow.sort(function(elem1, elem2) { 
            return elem1.width - elem2.width; 
        })[currentRow.length-1].width;
        let margin = marginEpsilon * maxBoxWidthInRow;
        currentRow.forEach(cluster => {
            let boundingBox = {
                xValue: x,
                yValue: y,
                width: cluster.width
            };
            window.departmentToBoundingBoxesMap[cluster.department] = boundingBox;
            
            x += margin + cluster.width;
        });
        x = 0; //reset to left
        y += margin + maxBoxWidthInRow; //last (aka max) estimated cluster width in this row
        i += nCols;
    }
}