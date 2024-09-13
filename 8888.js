async function fetchValidKeys() {
    const response = await fetch('validKeys.cbor'); 
    const buffer = await response.arrayBuffer();    
    return cbor.decode(buffer);                     
}

async function unlockPage() {
    const inputKey = document.getElementById("key-input").value.replace(/\s+/g, ''); 
    const errorMessage = document.getElementById("error-message");

    const validKeys = await fetchValidKeys();       

    if (validKeys.map(key => key.replace(/\s+/g, '')).includes(inputKey)) {
        document.getElementById("lock-screen").style.display = "none";
        document.getElementById("youtube-container").style.display = "none";
        document.getElementById("copyright-text").style.display = "none";  
        document.getElementById("chúcmừngnămmới").style.display = "none";  
        document.getElementById("content").style.display = "block";
    } else {
        errorMessage.style.display = "block";
    }
}