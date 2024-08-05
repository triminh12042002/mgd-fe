<script lang="ts">
    export let form;

    let file: string;
    
    // websocket scriptW

    let prompt;
    let socket;
    let finalImage = '';
    let segmentationImage = '';
    let posemapImage = '';


    // Only initialize WebSocket if running in the browser
    if (typeof window !== 'undefined') {
        // Establish WebSocket connection
        let socketServerUrl = "ws://127.0.0.1:8080/generating"
        socket = new WebSocket(socketServerUrl);

        socket.onopen = () => {
            console.log('WebSocket connection established');
            // alert('WebSocket Generating connection successful. Please check the server URL.');

            const message = {
                mess: "generating supplementary data"
            };
            //console.log("Sending message:",message)
            //socket.send(JSON.stringify(message));
        };

        socket.onmessage = function(event) {
            const msg = JSON.parse(event.data);
            //console.log("return message", msg);
            if(msg.fileType && msg.fileName && msg.fileData){
                if (msg.fileType == "segmentation") { // check message type, segmentation or pose map
                    let segmentationData = msg.fileData;
                    let segmentationBlob = b64toBlob(segmentationData, 'image/jpeg'); // Adjust MIME type as necessary
                    segmentationImage = URL.createObjectURL(segmentationBlob);
                    // console.log("Receive segmentation:", msg.fileName);
                    // let segmentationUrl = URL.createObjectURL(segmentationBlob);
                    // displayImage(segmentationUrl); // Function to display the image in your UI
                } else if (msg.fileType == "posemap") {
                    let posemapData = msg.fileData;
                    let posemapBlob = b64toBlob(posemapData, 'image/jpeg'); // Adjust MIME type as necessary
                    posemapImage = URL.createObjectURL(posemapBlob);
                    // console.log("Receive posemap:", msg.fileName);
                } else if (msg.fileType == "finalimage") {
                    let finalimageData = msg.fileData;
                    let finalimageBlob = b64toBlob(finalimageData, 'image/jpeg'); // Adjust MIME type as necessary
                    finalImage = URL.createObjectURL(finalimageBlob);
                    // console.log("Receive finalimage:", msg.fileName);
                } else {
                    console.log("receive unknown message file type")
                }
            } else {
                console.log("receive empty message");
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            alert('WebSocket connection failed. Please check the server URL.');
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }
    

    function sendPrompt(prompt) {
        // Send text prompt to the main service
        socket.send(JSON.stringify({ prompt }));
    }

    // Helper function to convert Base64 to Blob
    function b64toBlob(b64Data: string, contentType: string) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: contentType });
    }

    // Function to display the image in your UI
    function displayImage(imageUrl: string) {
        //const img = document.createElement('img');
        //img.src = imageUrl;
        //document.body.appendChild(img); // Adjust to append to the correct element
        segmentationImage = imageUrl;
    }
</script>

<section>
    <div>
        {#if segmentationImage}
            <h2>Segmentation</h2>
            <img width="100%" height="auto" src={segmentationImage} alt="Generated Segmentation" />
        {:else}
            <h1>Segmentation Generating</h1>
            <img height="10%" src="https://i.gifer.com/Vp3R.gif" alt="Loading..." />
        {/if}

    </div> 

    <div>
        {#if posemapImage}
            <h2>Pose Map</h2>
            <img width="100%" height="auto" src={posemapImage} alt="Generated Pose Map" />
        {:else}
            <h1>Pose Map Generating</h1>
            <img height="10%" src="https://i.gifer.com/Vp3R.gif" alt="Loading..." />
        {/if}
    </div>

    <div>
        {#if finalImage}
            <h2>Final Image</h2>
            <img width="100%" height="auto" src={finalImage} alt="Generated Final Image" />
        {:else}
            <h1>Final Image Generating</h1>
            <img height="10%" src="https://i.gifer.com/Vp3R.gif" alt="Loading..." />
        {/if}
    </div>
</section>

<style>
    button {
        margin-top: 15px;
        display: block;
    }

    section {
        display: grid;

        grid-template-columns: 20% 20% 20%  ;
        grid-template-rows: 1fr;
        gap: calc((100% - (3 * 20%)) / 2);

        height: 100%;
    }

    .result {
        border: 2px solid var(--tiffany-blue);
        background-color: #fff;

        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
