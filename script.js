window.onload = () => document.querySelector('#urlInput').select(); // select URL input
const output = document.querySelector("#output"); // where to print output

function setStyles(textColor, backgroundColor, lineHeight) {
    output.style.color = textColor;
    output.style.backgroundColor = backgroundColor;
    output.style.lineHeight = lineHeight + "%";
}

function setLoading() {
    output.innerHTML = "<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LOADING -- PLEASE WAIT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>";
}

function calculateAscii(densityString, brightness) {
    const character = densityString[Math.round(brightness / (255 / (densityString.length - 1)))];
    return character == " " ? "&nbsp;" : character;
}

function calculateAsciiTrueColor(densityString, brightness, r, g, b) {
    return `<span style='color: rgb(${r}, ${g}, ${b});'>` + calculateAscii(densityString, brightness) + "</span>";
}


function handleSubmit(e) {
    e.preventDefault();
    const url = e.target.url.value;
    const textColor = e.target.textColor.value;
    const bgColor = e.target.bgColor.value;
    const lineHeight = e.target.lineHeight.value;
    const densityString = e.target.densityString.value;
    const trueColor = e.target.trueColor.value;
    const canvas = document.getElementById("myCanvas");
    const c = canvas.getContext("2d");
    c.clearRect(0, 0, canvas.width, canvas.height);

    setStyles(textColor, bgColor, lineHeight);
    setLoading();

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.addEventListener('error', () => {
        output.innerHTML = 'ERROR: Invalid image or permissions.'
    });
    image.addEventListener('load', () => {
        // scale image to fit THANK YOU to https://riptutorial.com/html5-canvas/example/19169/scaling-image-to-fit-or-fill-
        const scale = Math.min(64 / image.width, 64 / image.height);
        const x = 32 - image.width / 2 * scale;
        const y = 32 - image.height / 2 * scale;

        //draw scaled image to canvas
        c.drawImage(image, x, y, image.width * scale, image.height * scale);

        // get the pixel data for the image on the canvas -- 64 X 64
        const imageData = c.getImageData(0, 0, 64, 64);

        let asciiOutput = "";
        // loop through the pixel data of the image and average the rgb values, getting a brightness level for each pixel
        for (let i = 0; i < imageData.data.length; i+= 4) {
            const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3; // (R + G + B) / 3 // i = R, i+1 = G, i+2 = B, i+3 = alpha
            if (parseInt(trueColor) === 1) {
                asciiOutput += calculateAsciiTrueColor(densityString, brightness, imageData.data[i], imageData.data[i+1], imageData.data[i+2]);
            } else {
                asciiOutput += calculateAscii(densityString, brightness);
            }
            if ((i + 4) % (64 * 4) == 0) { //put a line break after 64 characters
                asciiOutput += "<br />";
            }
        }
        output.innerHTML = asciiOutput;
    });
}