function getCircleLayout() {
    let layout = cy.layout({name: 'circle'});
    return layout;
}

function getGridLayout() {
    let layout = cy.layout({name: 'grid'});
    return layout;
}

function getConcentricLayout() {
    let layout = cy.layout({name: 'concentric'});
    return layout;
}

function getCoseLayout() {
    let layout = cy.layout({name: 'cose', animate: false});
    return layout;
}

function getBreadthfirstLayout() {
    let layout = cy.layout({name: 'breadthfirst'});
    return layout;
}

function getRandomLayout() {
    let layout = cy.layout({name: 'random'});
    return layout;
}

function getCiseLayout() {
    let layout = cy.layout({
        name:'cise',
        clusters: function(node) {
            let dept = node.data('department');
            return window.departmentsClusterMap[dept];
        },
        // -------- Optional parameters --------
        // Whether to animate the layout
        // - true : Animate while the layout is running
        // - false : Just show the end result
        // - 'end' : Animate directly to the end result
        animate: false,
        
        // number of ticks per frame; higher is faster but more jerky
        refresh: 10, 
        
        // Animation duration used for animate:'end'
        animationDuration: undefined,
        
        // Easing for animate:'end'
        animationEasing: undefined,
        
        // Whether to fit the viewport to the repositioned graph
        // true : Fits at end of layout for animate:false or animate:'end'
        fit: true,
        
        // Padding in rendered co-ordinates around the layout
        padding: 30,
        
        // separation amount between nodes in a cluster
        // note: increasing this amount will also increase the simulation time 
        nodeSeparation: 12.5,
        
        // Inter-cluster edge length factor 
        // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
        idealInterClusterEdgeLengthCoefficient: 1.4,

        // Whether to pull on-circle nodes inside of the circle
        allowNodesInsideCircle: false,
        
        // Max percentage of the nodes in a circle that can move inside the circle
        maxRatioOfNodesInsideCircle: 0.1,
        
        // - Lower values give looser springs
        // - Higher values give tighter springs
        springCoeff: 0.45,
        
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: 4500,
        
        // Gravity force (constant)
        gravity: 0.25,
        
        // Gravity range (constant)
        gravityRange: 3.8, 

        // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
        ready: function(){
            // $loading.show();
        }, // on layoutready
        stop: function(){  // on layoutstop
            // setTimeout(100000000);
            // $loading.hide();
            // loading.classList.add('loaded');
        }
    });
    return layout;
}

function runDepartmentsClusterLayout() {
    if (!window.departmentsToLayoutsMap) {
        window.departmentsToLayoutsMap = new Object();
        window.departments.forEach(dept => {
            let box = window.departmentToBoundingBoxesMap[dept];
            let layoutForDepartment = getChildNodesInDepartment(dept).layout({
                name: 'circle',
                fit: false,
                boundingBox: {x1:box.xValue, y1:box.yValue, w:box.width, h: box.width},
                avoidOverlap: true
            })
            layoutForDepartment.run();
            window.departmentsToLayoutsMap[dept] = layoutForDepartment;
        });
    } else {
        window.departments.forEach(dept => {
            window.departmentsToLayoutsMap[dept].run();
        });
    }
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