document.getElementById("generate-btn").addEventListener("click", function () {
    const text = document.getElementById("text-input").value;
    const passcode = document.getElementById("passcode-input").value;
    const qrCodeContainer = document.getElementById("qr-code");
    qrCodeContainer.innerHTML = ""; // Clear previous QR code

    if (text && passcode) {
        // Combine the text and passcode
        const combinedData = `${text}:${passcode}`;
        const encodedData = btoa(combinedData);
        
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(encodedData)}&size=200x200`;
        
        const qrCode = document.createElement("img");
        qrCode.src = qrCodeUrl;
        qrCodeContainer.appendChild(qrCode);
        
        // Show download button
        document.getElementById("download-btn").style.display = 'block';
        document.getElementById("download-btn").onclick = function() {
            chrome.downloads.download({
                url: qrCodeUrl,
                filename: 'qr-code.png', // Specify the filename
                saveAs: true // Optional: open a save dialog
            });
        };
    } else {
        qrCodeContainer.innerHTML = "Please enter text and passcode.";
    }
});


// Switching to Decoding Screen
document.getElementById("switch-to-decoding").addEventListener("click", function () {
    document.getElementById("encoding-screen").style.display = "none";
    document.getElementById("decoding-screen").style.display = "block";
});

// Switching to Encoding Screen
document.getElementById("switch-to-encoding").addEventListener("click", function () {
    document.getElementById("decoding-screen").style.display = "none";
    document.getElementById("encoding-screen").style.display = "block";
});

// Decoding Functionality
document.getElementById("decode-btn").addEventListener("click", function () {
    const fileInput = document.getElementById("qr-input");
    const guessPasscode = document.getElementById("guess-passcode").value;
    const decodedOutput = document.getElementById("decoded-output");

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    const decodedData = atob(code.data); // Decode the base64 data
                    const [text, passcode] = decodedData.split(":");

                    if (passcode === guessPasscode) {
                        decodedOutput.innerText = `Decoded Text: ${text}`;
                    } else {
                        decodedOutput.innerText = "Incorrect passcode!";
                    }
                } else {
                    decodedOutput.innerText = "No QR code found!";
                }
            };
        };

        reader.readAsDataURL(file);
    } else {
        decodedOutput.innerText = "Please upload a QR code image.";
    }
});
