function unlockPage() {
    const inputKey = document.getElementById("key-input").value.replace(/\s+/g, ''); 
    const errorMessage = document.getElementById("error-message");

    fetch('keysweb.json')
        .then(response => response.json())
        .then(data => {
            const validKeys = data.keysweb.map(key => key.replace(/\s+/g, '')); 
            if (validKeys.includes(inputKey)) {
                document.getElementById("lock-screen").style.display = "none";
                document.getElementById("youtube-container").style.display = "none";
                document.getElementById("copyright-text").style.display = "none";  
                document.getElementById("chúcmừngnămmới").style.display = "none";  
                document.getElementById("content").style.display = "block";
            } else {
                errorMessage.style.display = "block";
            }
        })
        .catch(error => {
            console.error('Error fetching keys:', error);
            errorMessage.style.display = "block";
        });
}
