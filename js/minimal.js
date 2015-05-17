window.onload = function () {
//var url = 'files/tizenfordummies.pdf';
	//var url = 'files/Michael Simac, P.E. 04-28-2015_full.pdf';
	//var url = 'files/TypeScript_Succinctly.pdf';
	
	//var url = 'http://localhost/Home/DownloadFromBlob2?FileString=' + encodeURIComponent('Michael%20Simac,%20P.E.%2004-28-2015_full.pdf')+'&caseName=cro204';
	var url = 'http://localhost/Home/DownloadFromBlob2?FileString=' + encodeURIComponent('TypeScript_Succinctly.pdf')+'&caseName=cro204';


        PDFJS.disableWorker = true; //Not using web workers. Not disabling results in an error. This line is

  var pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1;

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
  
    pageRendering = true;
	jQuery("#pdfContainer").empty();
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
	
	 var viewport = page.getViewport(scale);
        var $canvas = jQuery("<canvas></canvas>");

        //Set the canvas height and width to the height and width of the viewport
        var canvas = $canvas.get(0);
        var context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        //Append the canvas to the pdf container div
        var $pdfContainer = jQuery("#pdfContainer");
        $pdfContainer.css("height", canvas.height + "px").css("width", canvas.width + "px");
        $pdfContainer.append($canvas);

        //The following few lines of code set up scaling on the context if we are on a HiDPI display
        var outputScale = getOutputScale();
        if (outputScale.scaled) {
            var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
                (1 / outputScale.sy) + ')';
            CustomStyle.setProp('transform', canvas, cssScale);
            CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

            if ($textLayerDiv.get(0)) {
                CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
                CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
            }
        }

        context._scaleX = outputScale.sx;
        context._scaleY = outputScale.sy;
        if (outputScale.scaled) {
            context.scale(outputScale.sx, outputScale.sy);
        }

        var canvasOffset = $canvas.offset();
        var $textLayerDiv = jQuery("<div />")
            .addClass("textLayer")
            .css("height", viewport.height + "px")
            .css("width", viewport.width + "px")
            .offset({
                top: canvasOffset.top,
                left: canvasOffset.left
            });

        $pdfContainer.append($textLayerDiv);


		
  
	
	  page.getTextContent().then(function(textContent) {
	
    	var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
                                                                       //the page. It is set to page.number - 1.
																	   
        textLayer.setTextContent(textContent);
        
        var renderContext = {
            canvasContext: context,
            viewport: viewport,
            textLayer: textLayer
        };
        
         page.render(renderContext);
		 
		 
        pageRendering = false;
   
	   });
	

    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  document.getElementById('prev').addEventListener('click', onPrevPage);

  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  document.getElementById('next').addEventListener('click', onNextPage);

  /**
   * Asynchronously downloads PDF.
   */
  PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });
  
  }