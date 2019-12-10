function setUpPathDisplayConstants() {
	
    if (typeof(window.defaultLinkStylesMap) === 'undefined') {
    	window.defaultLinkStylesMap = {};
    }
    window.defaultLinkStylesMap.INTERNAL_LINK_COLOR = 'red';
	window.defaultLinkStylesMap.INTERNAL_LINK_WIDTH = 4;
	window.defaultLinkStylesMap.EXTERNAL_LINK_COLOR = 'white';
	window.defaultLinkStylesMap.EXTERNAL_LINK_WIDTH = 2;
	window.defaultLinkStylesMap.LINK_HIGHLIGHT_COLOR = '#FF00CC';  // Purple Pizzazz'
	window.defaultLinkStylesMap.LINK_HIGHLIGHT_WIDTH = 10;

	// For restoring link colors and widths
	// after highlighting paths. I wish this
	// were a class, so there would be encapsulation!
	window.pathsToRestore = null;
	}

function courseFutures() {
	
	// If a path already highlighted, restore
	// it first:
	if (window.pathsToRestore !== null) {
		restorePathAppearance();
	};
	
	// Given starting course, and distance
	// from UI, highlight most likely follow-on
	// courses:
	fromCourseName = document.getElementById('from-course').value;
	
	// If no course was provided, just treat the 
	// path request button push as resetting all
	// the links, which we did above:
	if (fromCourseName.length == 0) {
		return;
	};
	
	fromCourseNode = cy.nodes(`[name = "${fromCourseName}"]`);
	fromCourseId   = fromCourseNode.data('id');

	if (fromCourseNode.length == 0) {
		alert(`Course "${fromCourseName}" is unknonw.`);
		return;
	};
	// Desired distance outward:
	distance = document.getElementById('distance').value;
	
	// Get an array of edge objects. The first originates
	// in the user-specified node; the next ones are 
	// paths out to user-specified distance.
	
	let edgeSeq = nextNCourses(fromCourseId, distance);
	//console.log(edgeSeq);
	
	// Remove all edges that are *not* one of the 
	// found edges. The return is a collection of 
	// removed edges. They are also remembered by
	// the Cytoscape core for later restoration.
	// Find all nodes and edges that are NOT the
	// successor edges we found (complement()). Filter
	// that collection only to include edges:
	
	let edgesToHide = edgeSeq.complement(cy.elements()).filter((el) => el.isEdge()) 
	let edgesMadeInvisible = edgesToHide.remove();
	
	// Save these paths' width/color before we change them for
	// better visibility:

	let originalNeighborLinkStyles = new Map();
	edgeSeq.forEach((edge) =>
		originalNeighborLinkStyles.set(edge.data('id'),
									   {'width' : edge.data('width'),
									    'color' : edge.data('color')}
	  						   		  )
	);
	
	window.pathsToRestore = {'neighborLinks' : edgeSeq,
							 'hiddenLinks'   : edgesMadeInvisible
	};

	// Make the edges more visible:
	edgeSeq.forEach(function(edgeObj) {
		edgeObj.data('width', window.defaultLinkStylesMap.LINK_HIGHLIGHT_WIDTH);
		edgeObj.data('color', window.defaultLinkStylesMap.LINK_HIGHLIGHT_COLOR);
		edgeObj.style('opacity', 1);
	});
	
	zoomToCollection(edgeSeq);
}

function restorePathAppearance() {
	// Restore color and width of all 
	// edge objs stored in pathsToRestore.
	
	if (typeof(window.pathsToRestore) === 'undefined' || window.pathsToRestore === null) {
		return;
	}
	
	let internalLinks = window.pathsToRestore.neighborLinks.filter('[is_internal = "internal"]')
	let externalLinks = window.pathsToRestore.neighborLinks.filter('[is_internal = "external"]')
	internalLinks.data('width', window.defaultLinkStylesMap.INTERNAL_LINK_WIDTH);
	internalLinks.data('color', window.defaultLinkStylesMap.INTERNAL_LINK_COLOR);
	internalLinks.style('opacity', window.defaultLinkStylesMap.DEFAULT_INTERNAL_LINK_OPACITY);
	
	externalLinks.data('width', window.defaultLinkStylesMap.EXTERNAL_LINK_WIDTH);
	externalLinks.data('color', window.defaultLinkStylesMap.EXTERNAL_LINK_COLOR);
	externalLinks.style('opacity', window.defaultLinkStylesMap.DEFAULT_EXTERNAL_LINK_OPACITY);
	
	window.pathsToRestore.hiddenLinks.restore();
	
	window.pathsToRestore = null;
}


function showShortestPath() {
	// could use Cytoscape Dijkstra*
}

function nextNCourses(courseId, distance, edgeCollection=null) {
	/*
	 * Given a node ID construct a collection of successor edges
	 * with highest probabilities. Outward travel terminates
	 * when distance nodes have been traversed.
	 * 
	 * Function is recursive. Each call finds one neighor
	 * with highest probability, and adds the respective edge
	 * to edgeCollection
	 * 
	 */

    if (distance == 0) {
    	return edgeCollection;
    }

	// First call:
	if (edgeCollection === null) {
		edgeCollection = cy.collection();
	}
	let nearestNeighbor = null;
	let connectionsToNeighbors = cy.edges(`[source = "${courseId}"]`)
	
	// From among all outgoing links, get the one
	// with the highest probability. BUT: if we already
	// visited the maximum edge, pick next lower probability.
	// Else would get caught in cycles:
	let edgeAndMaxVal = connectionsToNeighbors.max(function(edge) {
		edgeId = edge.data('id');
		return (edgeCollection.getElementById(edgeId).length) > 0 ? 0 : edge.data('weight')
	});
	
	// From the {edgeObj, prob} obj returned from max(),
	// get the edge obj:
	let mostLikelyEdge = edgeAndMaxVal.ele;
    edgeCollection.merge(mostLikelyEdge);
                            
    return nextNCourses(mostLikelyEdge.data('target'),
    					distance - 1,
    					edgeCollection
    					);
}

function zoomToCollection(col) {
	cy.animate({
		  fit: {
		    eles: col,
		    padding: 20
		  }
		}, {
		  duration: 1000
		});
	
}

function resetView() {
	cy.zoom(window.defaultGraphPosition.DEFAULT_ZOOM);
	cy.pan(window.defaultGraphPosition.DEFAULT_PAN);
}
