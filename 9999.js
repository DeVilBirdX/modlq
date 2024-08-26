function unlockPage() {
    const validKeys = ["0:s8siwii", "tulenvp0235/"];
    const inputKey = document.getElementById("key-input").value.replace(/\s+/g, ''); 
    const errorMessage = document.getElementById("error-message");

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