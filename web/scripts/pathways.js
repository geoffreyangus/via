var cy;

var elements = [ // list of graph elements to start with
    { // node a
      data: { id: 'a' }
    },
    { // node b
      data: { id: 'b' }
    },
    {
      data: { id: 'c'}
    },
    {
        data: { id: 'd'}
      },
      {
        data: { id: 'e'}
      },
      {
        data: { id: 'f'}
      },
    { // edge ab
      data: { id: 'ab', source: 'a', target: 'b' }
    }
];

var style = [ // the stylesheet for the graph
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
];

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

$(document).ready(function(){

    let loadJsonPromises = [];
    loadJsonPromises.push(loadJSON('data/example.json'))
    loadJsonPromises.push(loadJSON('data/exampleStyle.json'))

    Promise.all(loadJsonPromises).then(data => {
        // Parse JSON string into cytoscape object
        let cyjs = JSON.parse(data[0]);
        let cystyle = JSON.parse(data[1]);


        cy = cytoscape({
            container: document.getElementById('cy'), // container to render in
            elements: cyjs.elements,
            style: cystyle.style,
            layout: {
                name:'null'
            }
        });

    }).catch(error => {
        console.log(error);
    });
});

function changeLayout() {
    let selector = document.getElementById("layout-selector");
    let layoutName = selector.options[selector.selectedIndex].text;
    let layout;
    switch (layoutName) {
        case "grid":
            layout = cy.layout({name: 'grid'});
            break
        case "circle":
            layout = cy.layout({name: 'circle'});
            break
        case "breadthfirst":
            layout = cy.layout({name: 'breadthfirst'});
            break
        case "cose":
            layout = cy.layout({name: 'cose'});
            break
        case "cola":
            layout = cy.layout({
                name: 'cola',
                avoidOverlap: true
            });
            break
        case "avsdf":
            layout = cy.layout({name: 'avsdf-base'});
            break
        case "cise":
            var clusters = cy.elements().kMeans({
                k: 2,
                attributes: [
                    function( node ){ return edge.data('weight'); }
                ]
            });
            layout = cy.layout({
                name: 'cise',
                clusters: clusters,
                allowNodesInsideCircle: false
            })
        default:
            layout = cy.layout({
                name: 'null',
            
                ready: function(){},
                stop: function(){}
            });
    }
    layout.run();
}