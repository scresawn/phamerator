import {drawBlastAlignments} from './drawBlastAlignments.js';

export const blast = (q, d) => {

  //blastAlignmentsOutstanding = blastAlignmentsOutstanding + 1;

  var query = q;
  var subject = d;
  alignedGenomes.update({"query": query.phagename, "subject": subject.phagename}, {"query": query.phagename, "subject": subject.phagename}, {upsert: true});

  //console.log("query:", query, "subject:", subject, phagedata.length);
  var s1 = query.sequence;
  var s2 = subject.sequence;
 /////console.log("s1:", s1.length);
 /////console.log("s2:", s2.length);

  //myURL = "https://phamerator.org/blastalign";
  myURL = "http://localhost:8080";
  console.log("aligning", query.phagename, subject.phagename);

  $.ajax({
    type: "POST",
    method: "POST",
    url: myURL,
    data: {name1: query.phagename, name2: subject.phagename, dataset: dataset},
    dataType: 'json',
    jsonp: false,
    success: function (data) {
      //blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
      //drawBlastAlignments(blastAlignmentsOutstanding, data);
      setTimeout(drawBlastAlignments, 0, data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      //blastAlignmentsOutstanding = blastAlignmentsOutstanding - 1;
      alignedGenomes.remove({"query": query.phagename, "subject": subject.phagename});
     /////console.log("ERROR:", textStatus, errorThrown);
    }
  });
};
