var alreadyAdded = false;

Template.nav.events({
  "click .stats": function (event, template) {
      $('#statisticsModal').modal('open');
      console.log("modal opened");

      var numberOfGenomes = 0;
      var totalGenomeLength = 0;
      var meanGenomeLength = 0;
      var smallestGenome = "";
      var smallestGenomeLength = Number.MAX_SAFE_INTEGER;
      var largestGenome = "";
      var largestGenomeLength = Number.MIN_SAFE_INTEGER;

      var numberOfGenes = 0;
      var totalGeneLength = 0;
      var meanGeneLength = 0;
      var smallestGene = "";
      var smallestGeneLength = Number.MAX_SAFE_INTEGER;
      var largestGene = "";
      var largestGeneLength = Number.MIN_SAFE_INTEGER;

      var numberOfPhams = 0;
      var totalPhamMembers = 0;
      var meanPhamSize = 0;
      var smallestPham = "";
      var smallestPhamSize = Number.MAX_SAFE_INTEGER;
      var largestPham = "";
      var largestPhamSize = Number.MIN_SAFE_INTEGER;
      var oneMemberPhams = 0;

      var totalGC = 0;
      var totalBP = 0;
      var contentGC = 0;


      Genomes.find().forEach(function (i) {
        var x = i.sequence.length;
        numberOfGenomes++;
        totalGenomeLength += i.genomelength;

        while (x--) {
          if (i.sequence.charAt(x) === "G" || i.sequence.charAt(x) === "C") {
            totalGC++;
          }
          totalBP++;
        }

        if (i.genomelength < smallestGenomeLength) {
          smallestGenomeLength = i.genomelength;
          smallestGenome = i.phagename;
        }

        if (i.genomelength > largestGenomeLength) {
          largestGenomeLength = i.genomelength;
          largestGenome = i.phagename;
        }

        i.genes.filter(function (index) {
          var currentGeneLength = Math.abs(index.stop - index.start);
          numberOfGenes++;
          totalGeneLength += currentGeneLength;

          if (currentGeneLength < smallestGeneLength) {
            smallestGeneLength = currentGeneLength;
            smallestGene = index.geneID;
          }

          if (currentGeneLength > largestGeneLength) {
            largestGeneLength = currentGeneLength;
            largestGene = index.geneID;
          }
          //console.log("Current Gene Length:", currentGeneLength);
        });
      });
      //console.log("Number of Genes", numberOfGenes);

      Phams.find({}).fetch().filter(function (index) {
         numberOfPhams++;
         totalPhamMembers += index.size;

         if (index.size === 1) {
           oneMemberPhams++;
         }

        /*if (index.size < smallestPhamSize) {
           smallestPhamSize = index.size;
           smallestPham = index.name;
         }*/

         if (index.size > largestPhamSize) {
           largestPhamSize = index.size;
           largestPham = index.name;
         }
       });
       console.log("PHAM1:", numberOfPhams); //returns 22441
       console.log("PHAM2:", totalPhamMembers); //returns 259732
       console.log("G/C Occurrences:", totalGC, "Total BPs", totalBP);
       console.log("totalGeneLength", totalGeneLength);
       // why are totalBP and totalGeneLength different??


      meanGenomeLength = totalGenomeLength / numberOfGenomes;
      meanGeneLength = totalGeneLength / numberOfGenes;
      meanPhamSize = totalPhamMembers / numberOfPhams;
      contentGC = (totalGC / totalBP) * 100;
      console.log("GC CONTENT:", contentGC);


      if (!alreadyAdded) {
      //display the genome statistics
      document.getElementById("smallest-genome").insertAdjacentHTML("beforeEnd",
        smallestGenome + " - " + smallestGenomeLength + " bps");
      document.getElementById("largest-genome").insertAdjacentHTML("beforeEnd",
        largestGenome + " - " + largestGenomeLength + " bps");
      document.getElementById("mean-genome").insertAdjacentHTML("beforeEnd",
        Math.round(meanGenomeLength) + " bps");
      //display the gene statistics
      document.getElementById("smallest-gene").insertAdjacentHTML("beforeEnd",
        smallestGene + " - " + smallestGeneLength + " bps");
      document.getElementById("largest-gene").insertAdjacentHTML("beforeEnd",
        largestGene + " - " + largestGeneLength + " bps");
      document.getElementById("mean-gene").insertAdjacentHTML("beforeEnd",
        Math.round(meanGeneLength) + " bps");
      //display the pham statistics
      /*document.getElementById("smallest-pham").insertAdjacentHTML("beforeEnd",
        smallestPham + ", " + smallestPhamSize + " members");*/
      document.getElementById("single-pham").insertAdjacentHTML("beforeEnd",
        oneMemberPhams + " phams");
      document.getElementById("largest-pham").insertAdjacentHTML("beforeEnd",
        largestPham + " - " + largestPhamSize + " members");
      document.getElementById("mean-pham").insertAdjacentHTML("beforeEnd",
        Math.round(meanPhamSize) + " members");
      //GC content statistic
      document.getElementById("GC-content").insertAdjacentHTML("beforeEnd",
         contentGC.toFixed(2) + "%");


      alreadyAdded = true;
      }
    }
    //EVERYTHING GOES ABOVE HERE
  })
