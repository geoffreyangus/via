/* 
 * Initializes the following:
 *  - window.departments
 *  - window.numDepartments
 *  - window.departmentsClusterMap
 *  - window.departmentsClusterColors
 *  - window.departmentsClusterSizes
 *  - window.maxClusterSize
 */
function setUpClusterConstants() {
    return new Promise((resolve, reject) => {

        /* get basic departments list */
        window.departments = Array.from( new Set(
            cy.nodes().map(function( ele ){
                return ele.data('department');
            })
        ));
        window.numDepartments = window.departments.length;

        /* initialize maps from department to cluster and cluster color */
        window.departmentsClusterMap = new Object();
        window.departmentsClusterColors = new Object();

        for (let i = 0; i < departments.length; i++) {
            window.departmentsClusterMap[window.departments[i]] =  i;
            window.departmentsClusterColors[window.departments[i]] = randomColor();
        }

        /* compute cluster sizes and max cluster size */
        window.departmentsClusterSizes = new Object();
        let maxSize = 0;
        for (let i = 0; i < window.numDepartments; i++) {
            let dept = window.departments[i];
            window.departmentsClusterSizes[dept] = getClusterSize(dept);
            maxSize = Math.max(maxSize, window.departmentsClusterSizes[dept]);
        }
        window.maxClusterSize = maxSize;

        resolve();
    })
}

/* returns the size of the cluster defined by the department */
function getClusterSize(dept) {
    return window.cy.nodes().filter(function (ele) {
        return ele.data('department') === dept;
    }).size();
}