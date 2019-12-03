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
    loadJsonPromises.push(loadJSON('data/elementsSimple.json'));
    // loadJsonPromises.push(loadJSON('data/elementsFull.json'));
    loadJsonPromises.push(loadJSON('data/presetStyle.json'));
    // loadJsonPromises.push(loadJSON('data/cyStyle.json'));

    Promise.all(loadJsonPromises).then(data => {
        // Parse JSON string into cytoscape fields
        let cyElements = JSON.parse(data[0]).elements;
        cyElements.nodes.forEach(element => {
            element.data.parent = null; //add parent attribute for compound node creation
        });
        window.cyStyle = JSON.parse(data[1]).style;

        var cy = window.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: cyElements,
            style: window.cyStyle
        });

        //temporary to remove extraneous <BEGIN> and <END> nodes from elementsFull.json
        cy.remove('#22601');
        cy.remove('#21938');
        cy.boxSelectionEnabled(true);
        cy.ready(function() {
            setUpCyConstants().then(() => {
                setupRightClickToolbar();
                setDepartmentTagsTypeahead();
                computeBoundingBoxesForClusters();
                styleNodesByCluster();
                styleEdges();
            }).then(() => {
                addQTip();
                runInitialLayout();
            }).then(() => {
                window.supernodeApi = cy.expandCollapse({
					fisheye: false,
					animate: false,
					undoable: false,
					expandCueImage :"../images/icon-plus.png",
					collapseCueImage:"../images/icon-minus.png"
                });
                cy.nodes().on("expandcollapse.aftercollapse", function(event) { 
                    var supernode = cy.$('[id=\'' + this.data('id') + '\']');
                    updateCollapsedNodeInfo(supernode).then(() => {
                        updateCollapsedNodeStyle(supernode);
                        updateCollapsedNodeQTip(supernode);
                    }); 
                });
                cy.nodes().on("expandcollapse.afterexpand", function(event) { 
                    var supernode = cy.$('[id=\'' + this.data('id') + '\']');
                    updateExpandedNodeInfo(supernode).then(() => {
                        console.log('after info', supernode.data('p'));
                        updateExpandedNodeStyle(supernode);
                        updateCollapsedNodeQTip(supernode);
                    }); 
                })

            }).catch(error => {
                console.log(error);
            });
        });
        // var nav = cy.navigator();
        //heights and widths of navigator divs must be set after initialization else overwritten by extension
        // $('div.cytoscape-navigator').width(300).height(200);
        // $('div.cytoscape-navigatorView').width(30).height(30);
        cy.elements().unbind('mouseover');
        cy.elements().bind('mouseover', (event) => event.target.tippy.show());
        cy.elements().unbind('mouseout');
        cy.elements().bind('mouseout', (event) => event.target.tippy.hide());
        
    }).catch(error => {
        console.log(error);
    });
});

function runInitialLayout() {
    runDepartmentsClusterLayout();
    cy.fit(cy.elements, 20);
}

function changeLayout() {
    let selector = document.getElementById("layout-selector");
    let layoutName = selector.options[selector.selectedIndex].text;
    let layout;
    switch (layoutName) {
        case "clusters":
            runDepartmentsClusterLayout();
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
            layout = runDepartmentsClusterLayout();
    }

    if (layout) layout.run();
    cy.fit(cy.elements, 20);
}

function setUpCyConstants() {
    return new Promise((resolve, reject) => {
        setUpFilterConstants();
        setUpClusterConstants().then(() => {
            setUpCompoundNodes();
        }).then(() => {
            mapStylesToData();
        }).then(() => {
            console.log(cy.$('[id = \'supernode_CS\']').data());
            resolve();
        });
    })
}