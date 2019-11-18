function addQTip() {
    cy.nodes().qtip({
        content: function(){
            return 'Course: ' + this.data('name') +
                    '\n'+'Probability: ' + this.data('p');
                    
            },
        position: {
            my: 'top center',
            at: 'bottom center'
        },
        style: {
            classes: 'qtip-bootstrap',
            tip: {
                width: 16,
                height: 8
            }
        }
    });

    cy.edges().qtip({
        content: function(){
            return 'From ' + cy.getElementById(this.data('source')).data('name') + 
                    ' to ' + cy.getElementById(this.data('target')).data('name') +
                    '\n'+'Weight: ' + this.data('weight')},
        position: {
            my: 'top center',
            at: 'bottom center'
        },
        style: {
            classes: 'qtip-bootstrap',
            tip: {
                width: 16,
                height: 8
            }
        }
    });
}