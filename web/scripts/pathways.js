/*
 * XHR to get local cytoscape json file, returned as a promise
 */
var loadJSON = function(filepath) {
    return new Promise((resolve, reject) => {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', filepath, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                resolve(xobj.responseText);
            }
        };
        xobj.send(null);
    });
}

document.addEventListener('DOMContentLoaded', function(){
    var loading = document.getElementById('loading');

    let loadJsonPromises = [];
    // loadJsonPromises.push(loadJSON('data/elementsBrief.json'));
    loadJsonPromises.push(loadJSON('data/elementsFull.json'));
    // loadJsonPromises.push(loadJSON('data/elementsSimple.json'));
    loadJsonPromises.push(loadJSON('data/exampleStyle.json'));

    Promise.all(loadJsonPromises).then(data => {
        // Parse JSON string into cytoscape object
        var cyElements = JSON.parse(data[0]).elements;
        cyElements.nodes.forEach(element => {
            element.data.parent = null; //add parent attribute for compound node creation
        });
        console.log(cyElements);
        let cyStyle = JSON.parse(data[1]);

        var cy = window.cy = cytoscape({
            container: document.getElementById('cy'), // container to render in
            elements: cyElements
        });

        cy.ready(function() {
            cy.remove('node[name = \"<END>\"][name = \"<BEGIN>\"]');
            setUplayoutConstants();
            runInitialLayout();
            // addQTip();
        });

    }).catch(error => {
        console.log(error);
    });

});

function getCiseLayout() {
    let layout = cy.layout({
        name:'cise',
        clusters: function(node) {
            let dept = node.data('department');
            return departmentsClusterMap[dept];
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

function runInitialLayout() {

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

    /* set initial node and edge styles */

    cy.style().selector(':child').style({
        'background-color': function (ele) {
            return window.departmentsClusterColors[ele.data('department')];
        },
        'background-opacity': function (ele) {
            return 1;//ele.data('p')*10;
        },
        'border-width': 1,
        'border-color': 'black',
        'width': function (ele) {
            return Math.max(30, 100 * (1-1/(1+ele.data('p'))));
        },
        'height': function (ele) {
            return Math.max(30, 100 * (1-1/(1+ele.data('p'))));
        },
        'label': 'data(name)',
        'text-background-shape': 'roundrectangle',
        'text-background-color': 'white',
        'text-background-opacity': 1,
        'text-background-padding': '1px',
        'font-size': '8pt',
        'text-halign': 'center',
        'text-valign': 'center'
    }).update();

    /* hide visibility of parent nodes --
     * -- note using the visibility attribute hides the entire compound node, including children nodes */
    cy.style().selector(':parent').style({
        'background-opacity' : 0,
        'border-width': 0
    }).update();

    cy.style().selector('edge').style({
        'width': 2,
        'line-color': function (ele) {
            let weight = ele.data('weight');
            if (weight < 0.1) {
                return '#e5e5ff';
            } else if (weight < 0.2) {
                return '#b3b3ff';
            } else if (weight < 0.3) {
                return '#8080ff';
            } else if (weight < 0.4) {
                return '#4d4dff';
            } else if (weight < 0.5) {
                return '#1a1aff';
            } else if (weight < 0.6) {
                return '#0000e6';
            } else if (weight < 0.7) {
                return '#0000b3';
            } else if (weight < 0.8) {
                return '#000080';
            } else if (weight < 0.9) {
                return '#00004d';
            } else {
                return '#00001a';
            }
        },
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
    }).update();

    // let layout = getParents().layout({
    //     name:'cose', 
    //     animate: false,
    //     fit: false
    // });
    // layout.run();

    // console.log(window.departments.length);

    let boundingBoxes = getBoundingBoxes();
    for (let i = 0; i < window.numDepartments; i++) {
        let dept = window.departments[i];
        getChildNodesInDepartment(dept).layout({name: 'circle', fit:false, boundingBox: boundingBoxes[i], padding: 1000, avoidOverlap: false}).run();
    }
    setUpCompoundNodes(function() {
        
        addQTip();
        cy.fit()
    })
    // layout.pon('layoutstart').then(function( event ){
    //     $loading.show();
    //   });
    
}

function addQTip() {
    getChildren().qtip({
        content: function(){ return 'Node probability: ' + this.data('p') + '\n Parent: ' + this.parent().data('name')},
        position: {
            my: 'top center',
            at: 'bottom center'
        },
        style: {
            classes: 'qtip-bootstrap',
            tip: {
                width: 16,
                height: 8
            }
        }
    });

    cy.edges().qtip({
        content: function(){ return 'Edge weight: ' + this.data('weight') },
        position: {
            my: 'top center',
            at: 'bottom center'
        },
        style: {
            classes: 'qtip-bootstrap',
            tip: {
                width: 16,
                height: 8
            }
        }
    });
}

function changeLayout() {
    let selector = document.getElementById("layout-selector");
    let layoutName = selector.options[selector.selectedIndex].text;
    let layout;
    switch (layoutName) {
        case "cise":
            layout = getCiseLayout();
            break
        case "grid":
            layout = cy.layout({name: 'grid'});
            break
        case "circle":
            layout = cy.layout({name: 'circle'});
            break
        case "concentric":
            layout = cy.layout({name: 'concentric'});
            break
        case "cose":
            layout = cy.layout({name: 'cose', animate: false});
            break
        case "breadthfirst":
            layout = cy.layout({name: 'breadthfirst'});
            break
        case "random":
            layout = cy.layout({name: 'random'});
            break
        default:
            layout = cy.layout({
                name: 'null',
            
                ready: function(){},
                stop: function(){}
            });
    }
    layout.run();
}

var elesRemovedByFilter = null;
function filter() {
    let field = document.getElementById("department-name-field");
    let dept = field.value;
    nodesRemoved = cy.nodes().filter(function (ele) {
        return ele.data('department') != dept;
    });

    elesRemovedByFilter = nodesRemoved.remove();
}

function clearFilters() {
    if (elesRemovedByFilter != null) {
        elesRemovedByFilter.restore();
        elesRemovedByFilter = null;
    }
}