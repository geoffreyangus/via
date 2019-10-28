function setUpCompoundNodes(callback) {
    for (let i = 0; i < window.departments.length; i++) {
        let dept = window.departments[i];
        window.cy.add({
            group : "nodes",
            data: {
                id: '!special_' + i,
                name: "compound_" + dept,
                p: 0,
                department: dept,
            }

        });
        let children = cy.nodes().filter(function (ele) {
            return ele.data('department') === dept;
        });

        children.forEach(child => {
            child.data('parent', '!special_' + i);
            console.log(child.json());
        });
    }
    
    callback();
}

