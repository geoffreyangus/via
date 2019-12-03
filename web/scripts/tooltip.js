function addQTip() {
  cy.elements().forEach(function(ele) {
    if (ele.tippy) ele.tippy.popper._tippy.destroy();
    makePopper(ele);
  });
}

function updateCollapsedNodeQTip(supernode) {
  if (supernode.tippy) supernode.tippy.popper._tippy.destroy();
  makePopper(supernode);
  supernode.unbind('mouseover');
  supernode.bind('mouseover', () => supernode.tippy.popper._tippy.show());
  supernode.unbind('mouseout');
  supernode.bind('mouseout', () => supernode.tippy.popper._tippy.hide());
}

function updateExpandedNodeQTip(supernode) {
  supernode.tippy.popper._tippy.destroy()
}

function makePopper(ele) {
    let ref = ele.popperRef(); // used only for positioning
    if (ele.isNode() && (ele.isChild() || ele.hasClass('cy-expand-collapse-collapsed-node'))) {
        ele.tippy = tippy(ref, { // tippy options:
            content: () => {
              let content = document.createElement('div');
              let courseNameHeader = document.createElement('h6');
              courseNameHeader.innerHTML = ele.data('name');
              content.appendChild(courseNameHeader);
              let probabilityP = document.createElement('p');
              probabilityP.innerHTML = "p = " + ele.data('p');
              content.appendChild(probabilityP);
              if (ele.data('degree')) {
                let degreeP = document.createElement('p');
                degreeP.innerHTML = "degree = " + ele.data('degree');
                content.appendChild(degreeP);
              }
              if (ele.data('in-degree')) {
                let indegreeP = document.createElement('p');
                indegreeP.innerHTML = "in-degree = " + ele.data('in-degree');
                content.appendChild(indegreeP);
              }
              if (ele.data('out-degree')) {
                let outdegreeP = document.createElement('p');
                outdegreeP.innerHTML = "out-degree = " + ele.data('out-degree');
                content.appendChild(outdegreeP);
              }
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
