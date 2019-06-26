Template.phages.onDestroyed(function () {
  $(document).ready(function() {
    console.log('Template.phages.onDestroyed');
    $('#mapSettings').remove();
    $('#geneData').remove();
  });
  hspData = [];
});
