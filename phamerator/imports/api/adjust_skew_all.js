import { adjust_skew } from './adjust_skew.js';

export const adjust_skew_all = () => {
  //console.log("adjust_skew_all()");
  var phages = d3.selectAll(".phages")
  phages.each(function (d) {
    adjust_skew(this);
  });
}
