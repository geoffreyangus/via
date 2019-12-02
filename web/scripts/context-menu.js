function setupRightClickToolbar() {
    window.cy.on('cxttap', function(event) { 
        let target = event.target;
        if ((target != cy) && (target.isNode() || target.isEdge())) {
            target.select();
        }
    });

    let selectAllOfTheSameType = function(typeToSelect) {
        window.cy.elements().unselect();
        if (typeToSelect == 'node') {
            window.cy.nodes().select();
        }
        else {
            window.cy.edges().select();
        }
    };

    let showInLinksOnly = function(node) {
        clearLinkFilter();
        if (!node.selected()) {
            var incomers = node.incomers().union(node);
        } else {
            var incomers = cy.nodes(':selected').incomers().union(cy.nodes(':selected'));
        }
        let edgesToRemove = cy.edges().difference(incomers);
        let nodesToRemove = cy.nodes().difference(incomers);
        let itemsToRemove = nodesToRemove.union(edgesToRemove);
        window.collectionRemovedByLinkDirectionFilter = itemsToRemove.remove();
    }

    let clearLinkFilter = function() {
        window.collectionRemovedByLinkDirectionFilter.restore();
        window.collectionRemovedByLinkDirectionFilter = cy.collection();
    }

    let showOutLinksOnly = function(node) {
        clearLinkFilter();
        if (!node.selected()) {
            var incomers = node.outgoers().union(node);
        } else {
            var incomers = cy.nodes(':selected').outgoers().union(cy.nodes(':selected'));
        }
        let edgesToRemove = cy.edges().difference(incomers);
        let nodesToRemove = cy.nodes().difference(incomers);
        let itemsToRemove = nodesToRemove.union(edgesToRemove);
        window.collectionRemovedByLinkDirectionFilter = itemsToRemove.remove();
    }
    
    window.cxtMenu = cy.contextMenus({
        menuItems: [
            //begin link filters
            {
                id: 'show-in-links-only',
                content: 'show in links only',
                tooltipText: 'show in links only',
                selector: 'node',
                onClickFunction: function (event) {
                    showInLinksOnly(event.target);
                    window.cxtMenu.disableMenuItem('show-in-links-only');
                }
            },
            {
                id: 'show-out-links-only',
                content: 'show out links only',
                tooltipText: 'show out links only',
                selector: 'node',
                onClickFunction : function (event) {
                    showOutLinksOnly(event.target);
                    window.cxtMenu.disableMenuItem('show-out-links-only');
                },
                hasTrailingDivider: true
            },
            {
                id: 'clear-link-filter',
                content: 'clear link filter',
                tooltipText: 'clear link filter',
                image: {src : "images/remove.svg", width : 12, height : 12, x : 5, y : 4},
                selector: 'node',
                coreAsWell: true,
                onClickFunction: function (event) {
                    clearLinkFilter();
                    window.cxtMenu.enableMenuItem('show-in-links-only');
                    window.cxtMenu.enableMenuItem('show-out-links-only');
                },
                hasTrailingDivider: true
            },// begin node selectors
            {
                id: 'select-all-nodes',
                content: 'select all nodes',
                tooltipText: 'select all nodes',
                selector: 'node',
                coreAsWell: true,
                onClickFunction: function (event) {
                  selectAllOfTheSameType('node');
                }
            },
            {
                id: 'select-all-nodes-in-department',
                content: 'select all nodes in department',
                tooltipText: 'select all nodes in department',
                selector: 'node',
                onClickFunction: function (event) {
                    getNodesInDepartment(event.target.data('department')).select();
                },
                hasTrailingDivider: true
            },
            {
                id: 'remove-selected',
                content: 'remove selected',
                tooltipText: 'remove selected',
                image: {src : "images/remove.svg", width : 12, height : 12, x : 5, y : 4},
                selector: 'node, edge',
                coreAsWell: true,
                onClickFunction: function (event) {
                    cy.$(':selected').remove();
                },
                hasTrailingDivider: true
            }, // begin edge selectors
            {
                id: 'select-all-edges',
                content: 'select all edges',
                tooltipText: 'select all edges',
                selector: 'edge',
                coreAsWell: true,
                onClickFunction: function (event) {
                  selectAllOfTheSameType('edge');
                }
            },
        ]
    });
}