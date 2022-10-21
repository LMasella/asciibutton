function selectInput() {
    document.querySelector('#urlInput').select();
}
window.onload = selectInput();


var myForm = document.getElementById('myForm');
        myForm.onsubmit = function(e) {
            e.preventDefault();
            var form = new FormData(myForm);
            fetch("/process", { method: 'POST', body : form})
            .then( response => response.json() )
            .then( data => {
                var makecanvas = document.querySelector("#makeCanvas"); //where to create the canvas
                var output = document.querySelector("#output"); //where to print output
                output.style.color = data['textColor'];
                output.style.backgroundColor = data['bgColor'];
                output.style.lineHeight = '100%';
                output.innerHTML = "LOADING -- PLEASE WAIT...";
                var densityString = data['asciiString']; //the string of ascii characters, least dense -> most dense
                var img1 = new Image(); //create new image object
                img1.crossOrigin = 'anonymous'; // needed for cross-domain urls to work -- possible security risk! CORS
                img1.src = data['url']; //sets image url
                img1.addEventListener('error', function handleError() {
                    output.innerHTML = 'ERROR: Invalid image or permissions.'
                });
                img1.addEventListener('load', () => { //once the image is loaded...
                    output.style.lineHeight = data['lineHeight'] + '%';
                    makecanvas.innerHTML = `<canvas id="myCanvasOG" width="64" height="64"></canvas>`; //creates 64x64 canvas
                    var canvasog = document.querySelector("#myCanvasOG"); //selects canvas
                    var ctxog = canvasog.getContext("2d"); //selects canvas context
                    // scales image to fit THANK YOU to https://riptutorial.com/html5-canvas/example/19169/scaling-image-to-fit-or-fill-
                    var scale = Math.min(64 / img1.width, 64 / img1.height);
                    var x = 32 - img1.width / 2 * scale;
                    var y = 32 - img1.height / 2 * scale;
                    //
                    ctxog.drawImage(img1, x, y, img1.width * scale, img1.height * scale); //draws scaled image to canvas
                    var myImageData = ctxog.getImageData(0, 0, 64, 64); //gets the pixel data for the image on the canvas
                    output.innerHTML = ""; //resets ascii image
                    var innerString = "";
                    for (let i = 0; i < myImageData.data.length; i += 4) { //loops through the pixel data of the image and averages the rgb values, getting a brightness level per pixel
                        var avg = (myImageData.data[i] + myImageData.data[i + 1] + myImageData.data[i + 2]) / 3; // (r + g + b) / 3 // red = i, green = i+1, blue = i+2, alpha = i+3
                        //determines which character from density string to print -- changes a space to &nbsp; allowing it to actually print
                        if (parseInt(data['trueColor']) === 1) {
                            innerString += densityString[Math.round(avg / (255 / (densityString.length - 1)))] == " " ? '&nbsp;' : `<span style='color: rgb(${myImageData.data[i]}, ${myImageData.data[i+1]}, ${myImageData.data[i+2]});'>` + densityString[Math.round(avg / (255 / (densityString.length - 1)))] + "</span>";
                        }
                        else {
                            innerString += densityString[Math.round(avg / (255 / (densityString.length - 1)))] == " " ? '&nbsp;' : densityString[Math.round(avg / (255 / (densityString.length - 1)))];
                        }
                        if ((i + 4) % (64 * 4) == 0) { //put a line break after 64 characters
                            innerString += "<br />";
                        }
                    }
                    output.innerHTML = innerString;
                }, false);
            });
        }

                                    //if (myImageData.data[i+3] == 0) output.innerHTML += '`';     // HANDLING TRANSPARENCY...