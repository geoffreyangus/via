function setUpLayoutConstants() {
    return new Promise((resolve, reject) => {
        /* get mappping from department name to cluster id and color */
    
    window.departmentsClusterMap = new Object();
    window.departmentsClusterColors = new Object();

    window.departments = Array.from( new Set(
        cy.nodes().map(function( ele ){
            return ele.data('department');
        })
    ));
    window.numDepartments = window.departments.length;

    for (let i = 0; i < departments.length; i++) {
        window.departmentsClusterMap[window.departments[i]] =  i;
        window.departmentsClusterColors[window.departments[i]] = randomColor();
    }
    })
}