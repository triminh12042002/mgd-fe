<script lang="ts">
    export let data;

    import FileInput from "$lib/FileInput.svelte";
    import FileImage from "$lib/FileImage.svelte";
    import { Editor } from "@pixlrlte/pixlr-sdk";

    import { goto } from '$app/navigation';

    let currentFiles: { open: boolean, file: File}[] = [];
    let currentSketch: { open: boolean, file: File} = {};
    let frame: HTMLIFrameElement;
    let editor: Editor;

    function filesChanged(e: Event) {
        const files = (e.target as HTMLInputElement)?.files;

        if (files?.length && files.length > 0) {
            //currentFiles = [
            //    ...currentFiles,
            //    ...Array.from(files).map(file => ({open: false, file}))
            //]
            currentFiles = [{open: false, file: files[0]}]
        }
    }

    function sketchChange(e: Event) {
        const files = (e.target as HTMLInputElement)?.files;

        if (files?.length && files.length > 0) {
            currentSketch = {open: false, file: files[0]}
        }
    }

    async function openFile(file: File, idx: number) {
        if (!editor) {
            editor = await Editor.connect(data.token, frame);
        }

        currentFiles[idx].open = true;

        for await (const newFile of editor.open(file)) {
            currentFiles[idx] = { open: true, file: newFile };
        }

        currentFiles[idx].open = false;
    }

    async function openSketch(file: File) {
        if (!editor) {
            editor = await Editor.connect(data.token, frame);
        }

        currentSketch.open = true;

        for await (const newFile of editor.open(file)) {
            currentSketch = { open: true, file: newFile };
        }

        currentSketch.open = false;
    }

    let description = "";
    let sketchFile;
    let socket;
    
    async function sendFileOverWebSocket() {
        if (currentSketch.file && currentFiles[0].file) {
            const reader1 = new FileReader();
            const reader2 = new FileReader();

            reader1.onload = function(event1) {
                const fileData1 = event1.target?.result;

                reader2.onload = function(event2) {
                    const fileData2 = event2.target?.result;

                    if (fileData1 && fileData2) {
                        socket = new WebSocket('ws://127.0.0.1:8080/ws');
                        socket.onopen = function() {
                            const message = {
                                fileName1: currentSketch.file.name,
                                fileData1: fileData1.toString().split(',')[1], // Extract base64 part
                                fileName2: currentFiles[0].file.name,
                                fileData2: fileData2.toString().split(',')[1], // Extract base64 part
                                caption: description, // Your string data
                            };
                            console.log("Sending message:",message)
                            socket.send(JSON.stringify(message));
                        };

                        socket.onmessage = function(event) {
                            const message = JSON.parse(event.data);
                            if (message.segmentationData && message.segmentationName) {
                                const segmentationData = message.segmentationData;
                                const segmentationBlob = b64toBlob(segmentationData, 'image/jpeg'); // Adjust MIME type as necessary
                                const segmentationUrl = URL.createObjectURL(segmentationBlob);
                                console.log("Receive Segmentation");
                                displayImage(segmentationUrl); // Function to display the image in your UI
                            }
                        };
                    }
                };
                reader2.readAsDataURL(currentFiles[0].file)
            };
            reader1.readAsDataURL(currentSketch.file);
        }
    }


    async function generateImage() {
        sendFileOverWebSocket()
        console.log("Send all data successfully")
        // Redirect to "/http"
        goto('/http');
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
        const img = document.createElement('img');
        img.src = imageUrl;
        document.body.appendChild(img); // Adjust to append to the correct element
    }


</script>

<section>
    <div>

    <form>
        <label class="button">
            Input your Image
            <input type="file" accept="image/*" on:change={filesChanged} />
        </label>

         <div class="images">
            {#each currentFiles as {open, file}, i}
                {#if open} 
                    <div class="mark-open">
                        <FileImage file={file} />
                    </div>
                {:else}
                    <button on:click={() => openFile(file, i)}>   
                        <FileImage file={file} />            
                    </button>
                {/if}
            {/each}
        </div>
        
        <div>⠀</div>

        <label class="button">
            Input your Sketch
            <input type="file" accept="image/*" on:change={sketchChange} />
        </label>

        <div class="images">
                {#if currentSketch.open} 
                    <div class="mark-open">
                        <FileImage file={currentSketch.file} />
                    </div>
                {:else}
                    <button on:click={() => openSketch(currentSketch.file)}>   
                        <FileImage file={currentSketch.file} />            
                    </button>
                {/if}
        </div>

        <div>⠀</div>

        <label class="button">
            <input bind:value={description} placeholder="Input your garment description"/>
        </label>
        
        <div>⠀</div>

        <label class="button" on:click={generateImage}>Generate Image</label>
    </form>
       

        
    </div>

    <!-- svelte-ignore a11y-missing-attribute -->
    <iframe 
        src="/iframe/empty"
        bind:this={frame}>
    </iframe>
</section>

<style>
    section {
        display: grid;

        grid-template-columns: 400px 1fr;
        grid-template-rows: 1fr;
        gap: 10px;

        height: 100%;
    }

    iframe {
        width: 100%;
        height: 100%;
        border: 2px solid var(--tiffany-blue);
    }

    button {
        cursor: pointer;
    }

    .images {
        margin-top: 10px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-auto-rows: 150px;   
        gap: 5px;
    }

    .mark-open {
        filter: saturate(0);
    }
</style>
