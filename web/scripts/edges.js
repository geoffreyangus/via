function styleEdges() {
    cy.style().selector('edge').style({
        'width': 2,
        'line-color': function (ele) {
            let weight = ele.data('weight');
            if (weight < 0.1) {
                return '#e5e5ff';
            } else if (weight < 0.2) {
                return '#b3b3ff';
            } else if (weight < 0.3) {
                return '#8080ff';
            } else if (weight < 0.4) {
                return '#4d4dff';
            } else if (weight < 0.5) {
                return '#1a1aff';
            } else if (weight < 0.6) {
                return '#0000e6';
            } else if (weight < 0.7) {
                return '#0000b3';
            } else if (weight < 0.8) {
                return '#000080';
            } else if (weight < 0.9) {
                return '#00004d';
            } else {
                return '#00001a';
            }
        },
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
    }).update();
}