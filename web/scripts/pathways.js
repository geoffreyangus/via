/*
 * layout options
 */

//places all nodes at (0,0)
var defaultLayout = {
    name: 'null',

    ready: function(){}, // on layoutready
    stop: function(){} // on layoutstop
};

//places nodes in well-formed grid
var gridLayout = {
    name: 'grid',
  
    fit: true, // whether to fit the viewport to the graph
    padding: 30, // padding used on fit
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
    nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
    spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    condense: false, // uses all available space on false, uses minimal space on true
    rows: undefined, // force num of rows in the grid
    cols: undefined, // force num of columns in the grid
    position: function( node ){}, // returns { row, col } for element
    sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
    transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
  };

//places nodes in circular clusters
var ciseLayout = {
    name: 'cise',

    clusters: [ ['n1','n2','n3'],
                ['n5','n6']
                ['n7', 'n8', 'n9', 'n10'] ],
};

/*
 * Request local cytoscape json file using AJAX GET request
 */
var loadJSON = function(filepath) {
    return new Promise((resolve, reject) => {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', filepath, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value 
                // but simply returns undefined in asynchronous mode
                resolve(xobj.responseText);
            }
        };
        xobj.send(null);
    });
}

$(document).ready(function(){
    let cy;

    // let loadJsonPromises = [];
    // loadJsonPromises.push(loadJSON('json/example.json'))
    // Promise.all(promises).then(function() {
    //     // returned data is in arguments[0], arguments[1], ... arguments[n]
    //     // you can process it here
    // }, function(err) {
    //     // error occurred
    // });

    loadJSON('json/example.json').then(response => {
        // Parse JSON string into cytoscape object
        let cyjs = JSON.parse(response);

        cy = cytoscape({
            container: document.getElementById('cy'), // container to render in
            elements: cyjs.elements,
            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                    'background-color': '#666',
                    'label': 'data(id)'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                    }
                }
            ],
            layout : defaultLayout
        });
    })
    .catch(error => {
        console.log(error);
    });
});