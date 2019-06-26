import Clipboard from 'Clipboard';
import { update_phages } from '../../imports/updatePhages.js';

selectedGenomes = new Meteor.Collection(null);
alignedGenomes = new Meteor.Collection(null);

var clipboard = new Clipboard('.btn-copy-link');
clipboard.on('success', function(e) {
  //console.log(e);
  //Materialize.toast('sequence copied!', 1000);
  M.toast({html: 'sequence copied!'})

  e.clearSelection();
});

let last_known_scroll_position = 0;
let ticking = false;

function translatePhageNames(scroll_pos) {
  // Do something with the scroll position
  d3.selectAll('text.phagename').attr('transform', function () {
    return 'translate(' + scroll_pos + ', -120)';
  });
}

window.addEventListener('scroll', function(e) {
  last_known_scroll_position = window.scrollX;

  if (!ticking) {
    window.requestAnimationFrame(function() {
      translatePhageNames(last_known_scroll_position);
      ticking = false;
    });

    ticking = true;
  }
});


function reSort() {
  body.selectAll("div.data").sort(function(a, b) {
    if ((a.favorite) && !(b.favorite)) {
      return 1;
    }
    else if (b.favorite && !(a.favorite)) {
      return -1;
    }
    if (a.cluster < b.cluster) {
      return -1;
    }
    else if (a.cluster > b.cluster) {
      return 1;
    }
    else if (+a.subcluster !== +b.subcluster) {
      return +a.subcluster - +b.subcluster;
    }
    else if (a.phagename < b.phagename) {
      //console.log(a.phagename, b.phagename, a.phagename < b.phagename);
      return -1;
    }
    else { return 1; }
  })
    .transition().duration(500)
    .style({
      top: function(d, i) {
        return 60 + ((i*30)) + "px";
      }
    })
}

hspData = [];
function findElement(arg) {
  //console.log(arg, this, (arg.query === this.query && arg.subject === this.subject));
  return (arg.query === this.query && arg.subject === this.subject);
}

Array.prototype.diff = function(a) {
  return this.filter(function(element, index, array) {
    return !(a.find(findElement, element));
  });
};


//var phageArray = [];
//var map_order = [];







updateSessionStore = function () {
console.log('updating selected data');
  //console.log('names:', selectedGenomes.find({}, {fields: {phagename: 1}}).fetch().map(function (p) {return p.phagename;}));
  ///Meteor.user().selectedData[Session.get('currentDataset')]['genomeMaps'] = selectedGenomes.find({}, {fields: {phagename: 1}}).fetch().map(function (p) {return p.phagename;});
  Meteor.user().selectedData[Session.get('currentDataset')]['genomeMaps'] = Genomes.find({sequence: {$exists:  1 }}, {fields: {phagename: 1}}).fetch().map(function (p) {return p.phagename;});
  console.log('updating selected data done');
};
