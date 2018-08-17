waitForEl = function(selector, callback) {
  if (jQuery(selector).length) {
    callback();
  } else {
    setTimeout(function() {
      console.log("waiting...");
      waitForEl(selector, callback);
    }, 100);
  }
};
