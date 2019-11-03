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
    setUpNodeConstants();
    var loading = document.getElementById('loading');

    let loadJsonPromises = [];
    // loadJsonPromises.push(loadJSON('data/elementsBrief.json'));
    loadJsonPromises.push(loadJSON('data/elementsFull.json'));
    // loadJsonPromises.push(loadJSON('data/elementsSimple.json'));
    // loadJsonPromises.push(loadJSON('data/exampleStyle.json'));

    Promise.all(loadJsonPromises).then(data => {
        // Parse JSON string into cytoscape fields
        let cyElements = JSON.parse(data[0]).elements;
        // let cyStyle = JSON.parse(data[1]).style;

        //add parent attribute for compound node creation
        cyElements.nodes.forEach(element => {
            element.data.parent = null; 
        });

        var cy = window.cy = cytoscape({
            container: document.getElementById('cy'), // container to render in
            elements: cyElements
        });

        //temporary to remove extraneous <BEGIN> and <END> nodes from elementsFull.json
        cy.remove('#22601');
        cy.remove('#21938');

        cy.ready(function() {
            
            setUpClusterConstants()
            .then(response => {
                computeBoundingBoxesForClusters();
                return setUpCompoundNodes();
            })
            .then(response => {
                styleNodesByCluster();
                styleEdges();
                addQTip();
                runInitialLayout();
                cy.boxSelectionEnabled(true);
                // showGrid();
            }).catch(error => {
                console.log(error);
            });
        });

    }).catch(error => {
        console.log(error);
    });

});

function runInitialLayout() {
    let layout = runDepartmentsClusterLayout(null);
    layout.run();
    cy.fit();
}

function changeLayout() {
    let selector = document.getElementById("layout-selector");
    let layoutName = selector.options[selector.selectedIndex].text;
    let layout;
    switch (layoutName) {
        case "clusters - uniform size":
            layout = runDepartmentsClusterLayout('uniform');
            break
        case "clusters - grid":
            layout = runDepartmentsClusterLayout('grid');
            break
        case "clusters - overlap":
            layout = runDepartmentsClusterLayout('overlap');
            break
        case "cise":
            layout = getCiseLayout();
            break
        case "grid":
            layout = getGridLayout();
            break
        case "circle":
            layout = getCircleLayout();
            break
        case "concentric":
            layout = getConcentricLayout();
            break
        case "cose":
            layout = getCoseLayout();
            break
        case "breadthfirst":
            layout = getBreadthfirstLayout();
            break
        case "random":
            layout = getRandomLayout();
            break
        default:
            layout = runDepartmentsClusterLayout(null);
    }
    layout.pon('layoutstart').then(() => {
        // $loading.show();
    });

    layout.run();
    
    layout.pon('layoutstop').then(() => {
        cy.fit();
    })

    cy.fit();
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