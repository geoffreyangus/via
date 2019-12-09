/* 
 * Initializes the following:
 *  - window.departments
 *  - window.numDepartments
 *  - window.departmentsClusterMap
 *  - window.departmentsClusterColors
 *  - window.departmentsClusterSizes
 *  - window.maxClusterSize
 */

// Switch to modules when time:
/*
import {INTERNAL_LINK_COLOR,
        INTERNAL_LINK_WIDTH,
        EXTERNAL_LINK_COLOR,
        EXTERNAL_LINK_WIDTH
        } from "./constants.js";
*/        
        
var INTERNAL_LINK_COLOR = 'red';
var INTERNAL_LINK_WIDTH = 4;
var EXTERNAL_LINK_COLOR = 'white';
var EXTERNAL_LINK_WIDTH = 2;

function setUpClusterConstants() {
    return new Promise((resolve, reject) => {

        /* get basic departments list */
        window.departments = Array.from( new Set(
            cy.nodes().map(function( ele ){
                return ele.data('department');
            })
        ));
        window.numDepartments = window.departments.length;

        /* initialize maps from department to cluster and cluster color */
        window.departmentsClusterMap = new Object();
        window.departmentsClusterColors = new Object();

        for (let i = 0; i < departments.length; i++) {
            window.departmentsClusterMap[window.departments[i]] =  i;
            window.departmentsClusterColors[window.departments[i]] = randomColor();
        }

        /* compute cluster sizes and max cluster size */
        window.departmentsClusterSizes = new Object();
        let maxSize = 0;
        for (let i = 0; i < window.numDepartments; i++) {
            let dept = window.departments[i];
            window.departmentsClusterSizes[dept] = getClusterSize(dept);
            maxSize = Math.max(maxSize, window.departmentsClusterSizes[dept]);
        }
        window.maxClusterSize = maxSize;

        resolve();
    })
}

function mapStylesToData() {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < window.numDepartments; i++) {
            let dept = window.departments[i];
            cy.nodes('[department="' + dept + '"]').data('backgroundColor', window.departmentsClusterColors[dept]);
        }

        //set edge colors and widths
        let edgesExternal = cy.edges('[is_internal="external"]');
        console.log(edgesExternal.size());
        edgesExternal.data('color', EXTERNAL_LINK_COLOR);
        edgesExternal.data('width', EXTERNAL_LINK_WIDTH);
        let edgesInternal = cy.edges('[is_internal="internal"]');
        console.log(edgesInternal.size());
        edgesInternal.forEach(function( edge ){
            //edge.data('color', window.departmentsClusterColors[edge.source().data('department')]);
        	edge.data('color', INTERNAL_LINK_COLOR);
            edge.data('width', INTERNAL_LINK_WIDTH);
        });
        resolve();
    })
}

/* returns the size of the cluster defined by the department */
function getClusterSize(dept) {
    return window.cy.nodes().filter(function (ele) {
        return ele.data('department') === dept;
    }).size();
}