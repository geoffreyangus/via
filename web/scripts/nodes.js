function setUpNodeConstants() {
    window.maxNodeWidth = 50;
}

function styleNodesByCluster() {
    cy.style().selector('node').selector(':child').style({
        'background-color': 'data(backgroundColor)',
        'background-opacity': 1,
        'width': function (ele) {
            return Math.max(30, maxNodeWidth * (1-1/(1+ele.data('p'))));
        },
        'height': function (ele) {
            return Math.max(30, maxNodeWidth * (1-1/(1+ele.data('p'))));
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

    cy.style().selector('node:parent:selected').style({
        // "border-width": 7,
        "background-opacity": 0.222,
        // "border-color": "gold",
        "background-color": "gold"
        
    }).update();

    cy.style().selector('node:parent:unselected').style({
        "border-width": 0,
        "background-opacity": 0.222,
        // "background-color": "data(backgroundColor)"
    }).update();
}

function updateCollapsedNodeInfo(supernode) {
    return new Promise((resolve, reject) => {
        let childNodes = window.supernodeApi.getCollapsedChildren(supernode).filter('node');
        let supernode_p = 0;
        childNodes.not('.notDisplayed').forEach(child => {
            console.log("here");
            supernode_p += child.data('p');
        });
        supernode.data('p', supernode_p);
        supernode.data('nCollapsed', childNodes.size());
        resolve();
    })
}

function updateCollapsedNodeStyle(supernode) {
    let backgroundColor = window.departmentsClusterColors[supernode.data('department')];
    let width = 5 * supernode.data('nCollapsed');
    let fontsize = Math.max(16, 2*supernode.data('nCollapsed')) + 'pt';
    supernode.style({
        "background-color": backgroundColor,
        "label": supernode.data('department'),
        "width": width,
        "height": width,
        "text-background-shape": 'roundrectangle',
        "text-background-color": 'white',
        "text-background-opacity": 1,
        "text-background-padding": '1px',
        "font-size": fontsize,
        "text-halign": 'center',
        "text-valign": 'center'
    });
}

function updateExpandedNodeInfo(supernode) {
    return new Promise((resolve, reject) => {
        supernode.removeData('p');
        resolve();
    });
}

function updateExpandedNodeStyle(supernode) {
    let backgroundColor = window.departmentsClusterColors[supernode.data('department')];
    let width = Math.max(30, 5 * supernode.data('nCollapsed'));
    let fontsize = Math.max(16, 2 * supernode.data('nCollapsed')) + 'pt';
    supernode.style({
        "background-color": 'white',
        "label": ""
    });
}
