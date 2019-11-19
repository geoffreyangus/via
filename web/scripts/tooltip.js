function addQTip() {
    cy.elements().forEach(function(ele) {
        makePopper(ele);
      });
    // window.cy.on('mouseover', 'node', function(event) {
    //     var node = event.cyTarget;
    //     node.qtip({
    //          content: 'hello',
    //          show: {
    //             event: event.type,
    //          },
    //          hide: {
    //             event: 'mouseout unfocus'
    //          }
    //     }, event);
    // });
    // cy.nodes().qtip({
    //     content: function(){
    //         return 'Course: ' + this.data('name') +
    //                 '\n'+'Probability: ' + this.data('p');
                    
    //         },
    //     position: {
    //         my: 'top center',
    //         at: 'bottom center'
    //     },
    //     style: {
    //         classes: 'qtip-bootstrap',
    //         tip: {
    //             width: 16,
    //             height: 8
    //         }
    //     }
    // });

    // cy.edges().qtip({
    //     content: function(){
    //         return 'From ' + cy.getElementById(this.data('source')).data('name') + 
    //                 ' to ' + cy.getElementById(this.data('target')).data('name') +
    //                 '\n'+'Weight: ' + this.data('weight')},
    //     position: {
    //         my: 'top center',
    //         at: 'bottom center'
    //     },
    //     style: {
    //         classes: 'qtip-bootstrap',
    //         tip: {
    //             width: 16,
    //             height: 8
    //         }
    //     }
    // });
}

function makePopper(ele) {
    let ref = ele.popperRef(); // used only for positioning
    if (ele.isNode()) {
        ele.tippy = tippy(ref, { // tippy options:
            content: () => {
              let content = document.createElement('div');
              let courseNameHeader = document.createElement('h6');
              courseNameHeader.innerHTML = ele.data('name');
              content.appendChild(courseNameHeader);
              let probabilityP = document.createElement('p');
              probabilityP.innerHTML = "p = " + ele.data('p');
              content.appendChild(probabilityP);
              return content;
            },
            trigger: 'manual' // probably want manual mode
        });
    } else if (ele.isEdge()) {
        ele.tippy = tippy(ref, { // tippy options:
            content: () => {
              let content = document.createElement('div');
              let sourceTargetHeader = document.createElement('h6');
              sourceTargetHeader.innerHTML = ele.source().data('name') + ' → ' + ele.target().data('name');
              content.appendChild(sourceTargetHeader);
              let weightP = document.createElement('p');
              weightP.innerHTML = "weight = " + ele.data('weight');
              content.appendChild(weightP);
              return content;
            },
            trigger: 'manual' // probably want manual mode
        });
    }
  }
