function addQTip() {
  cy.elements().forEach(function(ele) {
    makePopper(ele);
  });
}

function updateCollapsedNodeQTip(supernode) {
  console.log('supernodeL=: ', supernode);
  console.log(supernode.popper());
  makePopper(supernode);
  // supernode.unbind('mouseover');
  // supernode.bind('mouseover', (event) => event.target.tippy.show());
  // supernode.unbind('mouseout');
  // supernode.bind('mouseout', (event) => event.target.tippy.hide());
}

function updateExpandedNodeQTip(supernode) {
  supernode._tippy.destroy();
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
