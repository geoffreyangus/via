function addQTip() {
    getChildren().qtip({
        content: function(){
            return 'Course: ' + this.data('name') +
                    '<br></br>Parent: ' + this.parent().data('name') + 
                    '<br></br>Probability: ' + this.data('p');
                    
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
                    '<br></br>Weight: ' + this.data('weight')},
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