<script lang="ts">
    export let form;

    let file: string;
    
    // websocket scriptW

    let prompt;
    let socket;
    let finalImage = '';


    // Only initialize WebSocket if running in the browser
    if (typeof window !== 'undefined') {
        // Establish WebSocket connection
        let socketServerUrl = "ws://127.0.0.1:8080/ws"
        socket = new WebSocket(socketServerUrl);

        socket.onopen = () => {
            console.log('WebSocket connection established');
            alert('WebSocket connection successful. Please check the server URL.');

        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            alert('WebSocket connection failed. Please check the server URL.');
        };

        // Handle incoming messages
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            finalImage = data.url; // Assuming the image URL is in the 'url' field
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }
    

    function sendPrompt(prompt) {
        // Send text prompt to the main service
        socket.send(JSON.stringify({ prompt }));
    }
</script>

<section>
    <div>
        <h1>Image Generator</h1>
        <input type="text" bind:value={prompt} placeholder="Enter your prompt" />
        <button class="button" on:click={() => sendPrompt(prompt)}>Generate Image</button>

        {#if finalImage}
            <img src={finalImage} alt="Generated Image" />
        {/if}
    </div> 
</section>
<section>   
    <div>
        <p>Select an image and we will post it to the Pixlr API</p>

        <form method="post" enctype="multipart/form-data" action="?/open">
            <label class="button">
                <input
                    type="file"
                    accept="image/*"
                    name="file"
                    bind:value={file}
                />
                Select file
                {file ?? ""}
            </label>

            <button class="button" disabled={!file}>Open in Pixlr</button>
        </form>
    </div>

    <div class="result">
        {#if form?.fileName}
            <div>
                <img src="/upload/{form.fileName}" alt={form.fileName} />
            </div>
        {:else}
            <p>No image opened yet</p>
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

        grid-template-columns: 400px 1fr;
        grid-template-rows: 1fr;
        gap: 10px;

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
