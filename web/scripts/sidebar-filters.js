// Switch to modules when time:

/*
import {INTERNAL_LINK_COLOR,
        INTERNAL_LINK_WIDTH,
        EXTERNAL_LINK_COLOR,
        EXTERNAL_LINK_WIDTH,
		LINK_HIGHLIGHT_COLOR,
		LINK_HIGHLIGHT_WIDTH
        } from "./constants.js";
*/

var INTERNAL_LINK_COLOR = 'red';
var INTERNAL_LINK_WIDTH = 4;
var EXTERNAL_LINK_COLOR = 'white';
var EXTERNAL_LINK_WIDTH = 2;
var LINK_HIGHLIGHT_COLOR = '#FF00CC'; // Purple Pizzazz
var LINK_HIGHLIGHT_WIDTH = 10;

function setUpFilterConstants() {
    window.allElementsHiddenByFilters = window.cy.collection(); //elements (nodes + edges) that have been (collectively) hidden by active filters
    window.filteredElementsMap = {
        //key=property to filter on, value=all elements (in the original graph) that are captured by the filter
        'node probability': cy.collection(),
        'edge weight': cy.collection(),
        'department': cy.collection()
    };
}

function filterOnNodeProperty(allNodesCapturedByFilter, property) {
    let visibleElements = cy.$(':visible');
    // console.log('visibleNodes', visibleNodes.size());
    let allEdgesRelatedToCapturedNodes = allNodesCapturedByFilter.connectedEdges();
    let allElementsCapturedByFilter = allNodesCapturedByFilter.union(allEdgesRelatedToCapturedNodes);
    // console.log('allElementsCapturedByFilter', allElementsCapturedByFilter.size());
    window.filteredElementsMap[property] = allElementsCapturedByFilter;

    let elementsToRestore = window.allElementsHiddenByFilters;
    for (filterType in window.filteredElementsMap) {
        elementsToRestore = elementsToRestore.difference(window.filteredElementsMap[filterType]);
    }

    let elementsToRemove = visibleElements.intersection(allElementsCapturedByFilter);
    // console.log('nodesToRemove', nodesToRemove.size());
    elementsToRestore.removeClass('notDisplayed');
    // console.log('elementsToRestore', elementsToRestore.size());
    elementsToRemove.addClass('notDisplayed');
    
    window.allElementsHiddenByFilters = cy.$(':hidden');
}

// For restoring link colors and widths
// after highlighting paths. I wish this
// were a class, so there would be encapsulation!
var pathsToRestore = null;

function courseFutures() {
	
	// If a path already highlighted, restore
	// it first:
	if (pathsToRestore !== null) {
		restorePathAppearance();
	}
	
	// Given starting course, and distance
	// from UI, highlight most likely follow-on
	// courses:
	fromCourseName = document.getElementById('from-course').value;
	
	// If no course was provided, just treat the 
	// path request button push as resetting all
	// the links, which we did above:
	if (fromCourseName.length == 0) {
		return;
	}
	
	fromCourseId   = window.courseName2NodeId[fromCourseName];
	if (typeof(fromCourseId) === 'undefined') {
		alert(`Course "${fromCourseName}" is unknonw.`);
		return;
	}
	distance = document.getElementById('distance').value;
	
	// Get an array of edge objects. The first originates
	// in the user-specified node; the next ones are 
	// paths out to user-specified distance.
	
	edgeSeq = nextNCourses(fromCourseId, distance);
	//console.log(edgeSeq);
	
    let visibleElements = cy.$(':visible');
    let edgesMadeInvisible = visibleElements.difference(cy.edges());
    
	// Save these paths before we change them:
	pathsToRestore = {'neighborLinks' : edgeSeq,
					  'hiddenLinks'   : edgesMadeInvisible
	};
    
    // Make all edges invisible:
    cy.edges().addClass('notDisplayed')
    // Bring back the few between neighbors:
    edgeSeq.forEach((el) => el.removeClass('notDisplayed'))
	
	edgeSeq.forEach(function(edgeObj) {
		edgeObj.data('width', LINK_HIGHLIGHT_WIDTH);
		edgeObj.data('color', LINK_HIGHLIGHT_COLOR);
	});
}

function restorePathAppearance() {
	// Restore color and width of all 
	// edge objs stored in pathsToRestore.
	
	if (typeof(pathsToRestore) === 'undefined' || pathsToRestore === null) {
		return;
	}
	
	pathsToRestore['neighborLinks'].forEach(function(edgeObj) {
		edgeObj.data('width', EXTERNAL_LINK_WIDTH);
		edgeObj.data('color', EXTERNAL_LINK_COLOR);
	});
	
	pathsToRestore['hiddenLinks'].forEach((linkObj) => linkObj.removeClass('notDisplayed'))
	
	pathsToRestore = null;
}

function filterDepartments() {
    // console.log('-- filter departments --');
    let departmentsTagged = $("#department-names-field").val();
    // console.log(departmentsTagged);
    let nodesCapturedByFilter = cy.nodes().filter(function (ele) {
        // console.log(ele.data('department'));
        return !departmentsTagged.includes(ele.data('department'));
    });;
    // console.log('nodesCapturedByFilter', nodesCapturedByFilter.size());
    // console.log(nodesCapturedByFilter.json());
    filterOnNodeProperty(nodesCapturedByFilter, 'department');
}

function filterAllDepartments() {
	$('#department-names-field').tagsinput('removeAll');
	filterDepartments();
}

function filterNodeProbability() {
    // console.log('-- filter node prob --');
    let lowerboundInput = document.getElementById('node-prob-input-lowerbound');
    let upperboundInput = document.getElementById('node-prob-input-upperbound');

    let from = lowerboundInput.value != null ? lowerboundInput.value : lowerboundInput.defaultValue;
    if (from < 0.0 || from > 1.0) {
        lowerboundInput.value = 0;
    }
    let to = upperboundInput.value != null ? upperboundInput.value : upperboundInput.defaultValue;
    if (to < 0.0 || to > 1.0) {
        to = upperboundInput.value = 1;
    }
    if (from > to) {
        return; // error in range
    }

    let nodesCapturedByFilter = cy.elements('node[p < ' + from + '], node[p > ' + to + ']');
    // console.log('nodesCapturedByFilter', nodesCapturedByFilter.size());
    // console.log(nodesCapturedByFilter.json());
    filterOnNodeProperty(nodesCapturedByFilter, 'node probability');
}

function filterOnEdgeProperty(allEdgesCapturedByFilter, property) {
    let visibleEdges = cy.edges(':visible');
    window.filteredElementsMap[property] = allEdgesCapturedByFilter;

    let edgesToRestore = window.allElementsHiddenByFilters.intersection(cy.edges());
    for (filterType in window.filteredElementsMap) {
        edgesToRestore = edgesToRestore.difference(window.filteredElementsMap[filterType]);
    }

    let edgesToRemove = visibleEdges.intersection(allEdgesCapturedByFilter);
    edgesToRestore.removeClass('notDisplayed');
    edgesToRemove.addClass('notDisplayed');
    
    window.allElementsHiddenByFilters = cy.$(':hidden');
}

function filterEdgeWeight() {
    let lowerboundInput = document.getElementById('edge-weight-input-lowerbound');
    let upperboundInput = document.getElementById('edge-weight-input-upperbound');

    let from = lowerboundInput.value != null ? lowerboundInput.value : lowerboundInput.defaultValue;
    if (from < 0.0 || from > 1.0) {
        lowerboundInput.value = 0;
    }
    let to = upperboundInput.value != null ? upperboundInput.value : upperboundInput.defaultValue;
    if (to < 0.0 || to > 1.0) {
        to = upperboundInput.value = 1;
    }
    if (from > to) {
        return; // error in range
    }
    
    let allEdgesCapturedByFilter = cy.elements('edge[weight < ' + from + '], edge[weight > ' + to + ']');
    filterOnEdgeProperty(allEdgesCapturedByFilter, 'edge weight');
}

/* Andreas */

function setEdgePixelWidth() {
       let edgesExternal = cy.edges('[is_internal="external"]');
       let external_edge_width = document.getElementById('edge-width').value;
       edgesExternal.data('width', external_edge_width);
}

/* End Andreas */

function resetAllFilters() {
    //make all elements visible again
    window.allElementsHiddenByFilters.removeClass('notDisplayed');

    //reset input forms
    document.getElementById('node-prob-input-lowerbound').val = 0;
    document.getElementById('node-prob-input-upperbound').val = 1;
    document.getElementById('edge-weight-input-lowerbound').val = 0;
    document.getElementById('edge-weight-input-upperbound').val = 1;
    document.getElementById('edge-width').value = EXTERNAL_LINK_WIDTH;
    setEdgePixelWidth();
    initializeDepartmentTags();
}

/* Manage multi-tag select for department filtering */
function setDepartmentTagsTypeahead() {
    $('#department-names-field').tagsinput({
        typeahead: {
          source: window.departments
        },
        freeInput: false
    });
    initializeDepartmentTags();
}

function initializeDepartmentTags() {
    window.departments.forEach(dept => {
        $('#department-names-field').tagsinput('add', dept);
    });
}