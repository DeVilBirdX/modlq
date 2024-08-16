function unlockPage() {
    const validKeys = ["LqDay1-Cx72is9", "LqDay1-Cx72is9"];
    const inputKey = document.getElementById("key-input").value.replace(/\s+/g, ''); 
    const errorMessage = document.getElementById("error-message");

    if (validKeys.map(key => key.replace(/\s+/g, '')).includes(inputKey)) {
        document.getElementById("lock-screen").style.display = "none";
        document.getElementById("content").style.display = "block";
        document.querySelector(".youtube-container").style.visibility = "hidden";
    } else {
        errorMessage.style.display = "block";
    }
}