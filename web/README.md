# Via-web

## How to Run Via-web

**Offline**

Clone this repository and `cd` into the `web` directory. Start a simple webserver using `python -m http.server 8000`. View at localhost:8000.

Note: Offline version currently reads in graph data from the `data` directory. `data/elementsFull.json` contains the full dataset, while `data/elementsBrief.json` and `data/elementsSimple.json` contain the partial and simplified datasets, respectively, for testing.

## Via-web Files Breakdown

**HTML**

`index.html` - home page containing a scrollable side bar and cytoscape canvas.

**CSS** in `styles/`

`main.css` - general styles

`sidebar.css` - styles for the sidebar

`cytoscape-context-menus.css` and `cytoscape-navigator.css` are styles cytoscape extensions.

**JS** in `scripts/`

`pathways.js` - main script file, loads in json data, creates a new cytoscape object, calls functions in other files that set up constants/UI features/cytoscape layouts/styles, adds mouse event listeners, runs the initial layout and manages layout changes.

`tooltip.js` - manages popup over nodes and edges during mouseover.

`sidebar-filters.js` - manages filters controlled by the sidebar, including the department, edge weight, and node probability filters.

`nodes.js` - manages initial styles and updates to the style when the node is expanded/collapsed.

`edges.js` - manages the initial style of edges.

`context-menu.js` - manages the context menu options when the user right clicks on cytoscape canvas elements including the background, nodes, and edges. Currently, selecting a node gives options to show only in-links, show out-links, clear link filters, select all nodes, select all nodes in department and the option to permamently remove selected elements. selecting an edge gives the option to permamently remove selected elements.

`calculate.js` - contains functions used for computing extra information about the cytoscape graph. Currently, has functions that compute the in-degree, out-degree, and degree of all nodes in the graph and the ability to update the data displayed in the mouseover tooltip and show results in a modal window.

`clusters.js` - sets up commonly used variables regarding course departments and department clusters.

`compound-nodes.js` - manages the creation of compound nodes used for the supernode functionality. Also contains some functions to access child/parent nodes.

`layouts.js` - Return various cytoscape layouts. Contains functions that compute bounding boxes of department cluster to support a custom 'group by department' layout that visually organizing courses into department circles.

`extensions/` - directory to hold all third party cytcoscape-extension script files.


## Conceptual Understanding of Filtering Code

`window.allElementsHiddenByFilters` is a collection of elements (nodes and edges) that have been hidden from view by _all_ filter operations.

`window.filteredElementsMap` is a map where the key is the property that was filtered on and the value is all elements (nodes and edges) from the full set that said filter "captures" (aka, requires visual removal).

The `filterOnNodeProperty` and `filterOnEdgeProperty` work pretty much the same. The only primary difference is that the former requires also searching for connected edges to filter out.

These functions determine what elements to keep on the canvas and which elements to hide by:

- computing elements that should be restored by beginning with the set of all elements that have been filtered out, and subtracting the each set of elements captured by filters in `window.filteredElementsMap`.

- computing new elements to remove by intersecting the set of all elements captured by the new filter with elements currently visible on the canvas.


Note: Filtering does not actually remove elements from the view, it simply hides them visually as a performance consideration. Therefore, any calculations dependent upon removing filtered elements must first remove all elements in the collection `window.allElementsHiddenByFilters` (and subsequently restore them if appropriate). This is what degree computation is doing, since it is a rarer operation.


## Requirements for future web-connected Via application

Overall, json data delivered by a server should mimic the format of `data/elementsFull.json` begining with the "elements" object. Import attributes for a node's data object includes: id, name, p (probability), and department. Import attributes for an edge's data object includes: id, source, target, is_internal (values are "internal" or "external" which signifies if the edge is intra or inter-departmental), name, and weight. Any number of other useful information may be added to the data object as needed.


For backend filtering to work with the current front-end filtering set up, it is easiest to provide the front-end with the nodes 

## Ideas for future features

### Worth-focusing-on-first:
- ability to filter on the in-degree/out-degree/degree of a node after calculation.
- ability to sum up edges weights into "super edges" when a supernode is collapsed.
- gender filtering on course nodes by connecting with a server that delivers results from backend queries
- caching filter results in the browser
- making sure the sidebar department filter tags list is consistent with backend filtering or context menu filtering or element removal (eg. if a whole department is removed, should not show up as a tag).

### Nice-to-haves:
- more robust link filters on source and destination (other than the single source or destination essentially provided by the context menu).
- a navigator in the bottom corner that provides an overview / zooming capability
- warning modal to confirm removal of graph elements
- alphabetize courses in sidebar filter tags
- keyboard shortcuts to pan the canvas back to original zoom level (eg. keyboard event on '0' calls `cy.fit()`).

## Performance Notes
The most cost-intensive operations that slow the cytoscape canvas down are style udpates, particularly when more nodes/edges are on screen. Therefore, any styling that can be done initially (eg. loading `data/presetStyle.json`) or that can be limited to only relevant elements helps to avoid long render times.


