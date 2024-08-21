        function handleFileSelect() {
            const fileInput = document.getElementById('fileInput');
            const status = document.getElementById('status');

            if (fileInput.files.length) {
                status.textContent = '✅ Tệp đã được nhận!';
                status.classList.add('show');
                setTimeout(() => {
                    status.classList.add('fade')}, 5000); 
            }
        }

        document.getElementById('fileInput').addEventListener('change', handleFileSelect);

        function addPair() {
            const replacementContainer = document.getElementById('replacementContainer');
            const pairDiv = document.createElement('div');
            pairDiv.className = 'replacement-pair';
            pairDiv.innerHTML = `
                <input type="text" placeholder="Chữ Cần Sửa">
                <input type="text" placeholder="Chữ Thay Thế">
                <button class="remove-pair" onclick="removePair(this)">Xóa Cặp</button>
            `;
            replacementContainer.appendChild(pairDiv);    
        }

        function removePair(button) {
            const pairDiv = button.parentElement;
            pairDiv.remove();
        }

        async function replaceText() {
            const fileInput = document.getElementById('fileInput');
            const replacementContainer = document.getElementById('replacementContainer');
            const pairs = replacementContainer.querySelectorAll('.replacement-pair');
            const status = document.getElementById('status');

            if (!fileInput.files.length) {
                alert('Vui lòng chọn tệp zip.');
                return;
            }

            const replacements = Array.from(pairs).map(pair => {
                const oldText = pair.querySelector('input:nth-child(1)').value;
                const newText = pair.querySelector('input:nth-child(2)').value;
                return { oldText, newText };
            });

            for (const { oldText, newText } of replacements) {
                if (oldText === '' || newText === '') {
                    alert('Vui lòng nhập đầy đủ chữ cần sửa và chữ thay thế cho mỗi cặp.');
                    return;
                }
            }

            const zipFile = fileInput.files[0];
            const zip = new JSZip();
            const zipReader = new FileReader();

            zipReader.onload = async function(e) {
                try {
                    const zipContent = e.target.result;
                    const unzipped = await zip.loadAsync(zipContent);
                    const newZip = new JSZip();

                    for (const [filename, file] of Object.entries(unzipped.files)) {
                        if (!file.dir) {
                            if (filename.endsWith('.xml') || filename.endsWith('.txt')) {
                                let fileContent = await file.async('text');
                                for (const { oldText, newText } of replacements) {
                                    fileContent = fileContent.replace(new RegExp(oldText, 'g'), newText);
                                }
                                newZip.file(filename, fileContent);
                            } else {
                                newZip.file(filename, await file.async('blob'));
                            }
                        } else {
                            newZip.folder(filename);
                        }
                    }

                    const updatedZipContent = await newZip.generateAsync({ type: 'blob' });
                    saveAs(updatedZipContent, 'MOD ĐÃ XONG BÚ THÔI.zip');

                    status.textContent = '✅ Tệp đã mód xong';
                    status.classList.add('show');
                    setTimeout(() => {
                        status.classList.remove('show');
                    }, 5000);
                } catch (error) {
                    console.error('Lỗi khi xử lý tệp zip:', error);
                    alert('Đã xảy ra lỗi khi xử lý tệp zip.');
                }
            };

            zipReader.readAsArrayBuffer(zipFile);
        }


    async function processXmlZip() {
        const xmlZipInput = document.getElementById('xmlZipInput');
        const xmlOutput = document.getElementById('xmlOutput');
        const modType = document.querySelector('input[name="modType"]:checked').value;

        if (modType !== 'sangdam') {
            alert('Bạn đã chọn mod loại khác. Vui lòng chọn lại loại mod sáng đậm.');
            return;
        }

        if (!xmlZipInput.files.length) {
            alert('Vui lòng chọn tệp zip XML.');
            return;
        }

        const zipFile = xmlZipInput.files[0];
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);

        const files = Object.keys(zipContent.files);
        const xmlFiles = files.filter(filename => filename.endsWith('.xml'));

        for (let filename of xmlFiles) {
            let file = zipContent.files[filename];
            let xmlString;

            try {
                xmlString = await file.async('text');
            } catch (error) {
                console.warn(`Không thể đọc tệp: ${filename}. Bỏ qua.`);
                continue;
            }

            let parser = new DOMParser();
            let xmlDoc;

            try {
                xmlDoc = parser.parseFromString(xmlString, "text/xml");
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                    throw new Error("Error parsing XML");
                }
            } catch (error) {
                console.warn(`Không thể phân tích tệp XML: ${filename}. Bỏ qua.`);
                continue;
            }

            let tracks = xmlDoc.getElementsByTagName("Track");
            let tracksToDuplicate = [];

            Array.from(tracks).forEach(track => {
                const eventType = track.getAttribute('eventType');
                if (eventType === 'TriggerParticleTick' || eventType === 'TriggerParticle') {
                    tracksToDuplicate.push(track);
                }
            });

            tracksToDuplicate.forEach(track => {
                let newTracks = [];
                for (let i = 0; i < 15; i++) {
                    let newTrack = track.cloneNode(true);
                    newTracks.push(newTrack);
                }

                let parentElement = track.parentNode;
                newTracks.forEach(newTrack => {
                    parentElement.appendChild(newTrack);
                    let blankLine = document.createTextNode("\n");
                    parentElement.appendChild(blankLine);
                });

                newTracks.forEach(newTrack => {
                    let comment = document.createComment(" Tulen Dac Cau");
                    parentElement.appendChild(comment);
                });
            });

            let serializer = new XMLSerializer();
            let newXmlString = serializer.serializeToString(xmlDoc);
            zip.file(filename, newXmlString);
            xmlOutput.textContent += `Processed File: ${filename}\n`;
        }

        zip.generateAsync({ type: "blob" }).then(content => {
            let link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'sángđậmEFFect.zip';
            link.click();
        });
    }

    async function processXmlZip2() {
        const xmlZipInput = document.getElementById('xmlZipInput');
        const xmlOutput = document.getElementById('xmlOutput');
        const modType = document.querySelector('input[name="modType"]:checked').value;

        if (modType !== 'thapcam') {
            alert('Bạn đã chọn mod loại khác. Vui lòng chọn lại loại mod thập cẩm.');
            return;
        }

        if (!xmlZipInput.files.length) {
            alert('Vui lòng chọn tệp zip XML.');
            return;
        }

        const zipFile = xmlZipInput.files[0];
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);

        const files = Object.keys(zipContent.files);
        const xmlFiles = files.filter(filename => filename.endsWith('.xml'));

        for (let filename of xmlFiles) {
            let file = zipContent.files[filename];
            let xmlString;

            try {
                xmlString = await file.async('text');
            } catch (error) {
                console.warn(`Không thể đọc tệp: ${filename}. Bỏ qua.`);
                continue;
            }

            let parser = new DOMParser();
            let xmlDoc;

            try {
                xmlDoc = parser.parseFromString(xmlString, "text/xml");
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                    throw new Error("Error parsing XML");
                }
            } catch (error) {
                console.warn(`Không thể phân tích tệp XML: ${filename}. Bỏ qua.`);
                continue;
            }

            let tracks = xmlDoc.getElementsByTagName("Track");
            let tracksToDuplicate = [];

            Array.from(tracks).forEach(track => {
                const eventType = track.getAttribute('eventType');
                if (eventType === 'TriggerParticleTick' || eventType === 'TriggerParticle') {
                    tracksToDuplicate.push(track);
                }
            });

            tracksToDuplicate.forEach(track => {
                let resourceNameNode = track.querySelector('String[name="resourceName"]');
                if (resourceNameNode) {
                    let resourceName = resourceNameNode.getAttribute('value');
                    let match = resourceName.match(/prefab_skill_effects\/hero_skill_effects\/(\d{3}_\w+)\//);
                    if (match) {
                        let heroIdWithName = match[1];
                        let heroId = heroIdWithName.split('_')[0];
                        let effectPath = resourceName.split('/').slice(3).join('/'); 
                        let parentElement = track.parentNode;

                        for (let i = 1; i <= 20; i++) {
                            let newTrack = track.cloneNode(true);
                            let newResourceName = `prefab_skill_effects/hero_skill_effects/${heroIdWithName}/${heroId}${String(i).padStart(2, '0')}/${effectPath}`;
                            newTrack.querySelector('String[name="resourceName"]').setAttribute('value', newResourceName);

                            parentElement.appendChild(newTrack);
                            let blankLine = document.createTextNode("\n");
                            parentElement.appendChild(blankLine);

                            let comment = document.createComment(" Tulen Dac Cau");
                            parentElement.appendChild(comment);
                        }
                    }
                }
            });

            let serializer = new XMLSerializer();
            let newXmlString = serializer.serializeToString(xmlDoc);
            zip.file(filename, newXmlString);
            xmlOutput.textContent += `Processed File: ${filename}\n`;
        }

        zip.generateAsync({ type: "blob" }).then(content => {
            let link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'SKINThậpCẩm.zip';
            link.click();
        });
    }

function modifyFile() {
    const fileInput = document.getElementById('fileInput');
    const heroSelect = document.getElementById('heroSelect');
    const skinSelect = document.getElementById('skinSelect');
    const downloadLink = document.getElementById('downloadLink');

    if (!fileInput.files.length) {
        alert('Please select a file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const contents = new Uint8Array(event.target.result);
        const hero = heroSelect.value.split('_');
        const heroId = hero[0];
        const heroName = hero[1];
        const skinId = skinSelect.value;

        const oldPrefab1 = `VPrefab_Characters/Prefab_Hero/${heroId}_${heroName}/${heroId}1_${heroName}_LOD1`;
        const oldPrefab2 = `VPrefab_Characters/Prefab_Hero/${heroId}_${heroName}/${heroId}1_${heroName}_LOD2`;
        const oldPrefab3 = `VPrefab_Characters/Prefab_Hero/${heroId}_${heroName}/${heroId}1_${heroName}_LOD3`;

        const newPrefab1 = `VPrefab_Characters/Prefab_Hero/${heroId}_${heroName}/${heroId}${skinId}_${heroName}_LOD1`;
        const newPrefab2 = `VPrefab_Characters/Prefab_Hero/${heroId}_${heroName}/${heroId}${skinId}_${heroName}_LOD2`;
        const newPrefab3 = `VPrefab_Characters/Prefab_Hero/${heroId}_${heroName}/${heroId}${skinId}_${heroName}_LOD3`;

        
        const oldPrefab1Bytes = new TextEncoder().encode(oldPrefab1);
        const oldPrefab2Bytes = new TextEncoder().encode(oldPrefab2);
        const oldPrefab3Bytes = new TextEncoder().encode(oldPrefab3);

        const newPrefab1Bytes = new TextEncoder().encode(newPrefab1);
        const newPrefab2Bytes = new TextEncoder().encode(newPrefab2);
        const newPrefab3Bytes = new TextEncoder().encode(newPrefab3);

        
        let modifiedContents = contents.slice();

        
        function replaceBytes(source, target, replacement) {
            for (let i = 0; i <= source.length - target.length; i++) {
                let match = true;
                for (let j = 0; j < target.length; j++) {
                    if (source[i + j] !== target[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    for (let k = 0; k < replacement.length; k++) {
                        source[i + k] = replacement[k];
                    }
                }
            }
        }

        
        replaceBytes(modifiedContents, oldPrefab1Bytes, newPrefab1Bytes);
        replaceBytes(modifiedContents, oldPrefab2Bytes, newPrefab2Bytes);
        replaceBytes(modifiedContents, oldPrefab3Bytes, newPrefab3Bytes);

        
        const blob = new Blob([modifiedContents], { type: 'application/octet-stream' });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'tModSkin_' + file.name;
        downloadLink.click();  
    };

    reader.readAsArrayBuffer(file);
}

function downloadZip9() {
            var select = document.getElementById("championSelect");
            var selectedFile = select.value;
            if (selectedFile) {
                window.location.href = selectedFile;
            } else {
                alert("Vui lòng chọn nhân vật.");
            }
        }
        
        document.getElementById('modButton').addEventListener('click', async () => {
        const originalFile = document.getElementById('originalFile').files[0];
        const modFile = document.getElementById('modFile').files[0];
        
        if (!originalFile || !modFile) {
            alert('Please select both files.');
            return;
        }

        const originalBytes = new Uint8Array(await originalFile.arrayBuffer());
        const modBytes = new Uint8Array(await modFile.arrayBuffer());

        const startString = 'ArtPrefabLOD0';
        const endString = '_LOD3';
        const bytesBeforeStart = 8; 
        const startBytes = new TextEncoder().encode(startString);
        const endBytes = new TextEncoder().encode(endString);

        const originalRange = findRange(originalBytes, startBytes, endBytes, bytesBeforeStart);
        const modRange = findRange(modBytes, startBytes, endBytes, bytesBeforeStart);

        if (!originalRange || !modRange) {
            alert('Could not find the specified ranges in one or both files.');
            return;
        }

        const moddedBytes = new Uint8Array(originalBytes.length - (originalRange.end - originalRange.start) + (modRange.end - modRange.start));
        moddedBytes.set(originalBytes.slice(0, originalRange.start), 0);
        moddedBytes.set(modBytes.slice(modRange.start, modRange.end), originalRange.start);
        moddedBytes.set(originalBytes.slice(originalRange.end), originalRange.start + (modRange.end - modRange.start));

        const blob = new Blob([moddedBytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'SKINCHẾ_actorinfo.bytes';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    function findRange(array, startBytes, endBytes, bytesBeforeStart) {
        const start = indexOf(array, startBytes) - bytesBeforeStart;
        if (start < 0) return null;

        const end = indexOf(array, endBytes, start + startBytes.length + bytesBeforeStart);
        if (end === -1) return null;

        return { start, end: end + endBytes.length };
    }

    function indexOf(array, searchBytes, fromIndex = 0) {
        for (let i = fromIndex; i <= array.length - searchBytes.length; i++) {
            let found = true;
            for (let j = 0; j < searchBytes.length; j++) {
                if (array[i + j] !== searchBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return i;
        }
        return -1;
    }
    
    function downloadModCamXa() {
            const zoomLevelSelect = document.getElementById('zoomLevel');
            const fileUrl = zoomLevelSelect.value;
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileUrl.split('/').pop(); 
            link.click();
        }
        
        document.getElementById('download-MODRANK').addEventListener('click', function() {
        const selectElement = document.getElementById('ModRank-select');
        const selectedValue = selectElement.value;
        
        const a = document.createElement('a');
        a.href = selectedValue;
        a.download = selectedValue;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    
    function downloadFileModLinhQuaiTru(filename) {
            const link = document.createElement('a');
            link.href = filename;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function createModVideosex() {
    const fileInput = document.getElementById('videoUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a video file.');
        return;
    }

    const folderName = 'Mod sảnh video/files/Extra/2019.V2/ISPDiff/LobbyMovie/';
    const zip = new JSZip();
    const folder = zip.folder(folderName);

    const newFileName = 'PvpBtnDynamic132.mp4';

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;

        folder.file(newFileName, arrayBuffer);

        zip.generateAsync({ type: 'blob' }).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'Mod video Sảnh_LQ.zip';
            link.click();
        });
    };
}

function downloadModSoundAOV(link) {
            window.location.href = link;
        }

        const fileInput = document.getElementById('file-input');
        const musicPlayer = document.getElementById('music-player');
        const videoPlayer = document.getElementById('video-player');
        const playlistItems = document.querySelectorAll('.playlist-item');
        const musicOptions = document.getElementById('music-options');
        const fileInputButton = document.getElementById('file-input-button');
        const chooseFromDevice = document.getElementById('choose-from-device');
        const chooseFromYoutube = document.getElementById('choose-from-youtube');
        const closeOptions = document.getElementById('close-options');

        fileInputButton.addEventListener('click', function() {
            musicOptions.style.display = 'block';
        });

        chooseFromDevice.addEventListener('click', function() {
            musicOptions.style.display = 'none';
            fileInput.click();
        });

chooseFromYoutube.addEventListener('click', function() {
    musicOptions.style.display = 'none';
    const youtubeURL = prompt('Nhập Link Youtube:');
    if (youtubeURL) {
        let videoId = '';

        if (youtubeURL.includes('youtube.com/watch') || youtubeURL.includes('m.youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(youtubeURL).search);
            videoId = urlParams.get('v');
        } 
        else if (youtubeURL.includes('youtu.be/')) {
            videoId = youtubeURL.split('youtu.be/')[1]?.split('?')[0];
        } 
        else if (youtubeURL.includes('youtube.com/playlist')) {
            const urlParams = new URLSearchParams(new URL(youtubeURL).search);
            videoId = urlParams.get('list');
        }

        if (videoId) {
            let embedURL = '';
            if (youtubeURL.includes('youtube.com/playlist') || youtubeURL.includes('m.youtube.com/playlist')) {
                embedURL = `https://www.youtube.com/embed/?listType=playlist&list=${videoId}`;
            } else {
                embedURL = `https://www.youtube.com/embed/${videoId}`;
            }
            videoPlayer.src = embedURL;
            videoPlayer.style.display = "block";
            musicPlayer.style.display = "none";
        } else {
            alert('Link Nhạc không hợp lệ.');
        }
    }
});

        closeOptions.addEventListener('click', function() {
            musicOptions.style.display = 'none';
        });

        fileInput.addEventListener('change', function() {
            const files = fileInput.files;
            if (files.length > 0) {
                const fileURL = URL.createObjectURL(files[0]);
                musicPlayer.src = fileURL;
                videoPlayer.style.display = "none"; 
                musicPlayer.style.display = "block";
                musicPlayer.play();
            }
        });

        playlistItems.forEach(item => {
            item.addEventListener('click', function() {
                const src = item.getAttribute('data-src');
                const type = item.getAttribute('data-type');
                if (type === "video") {
                    videoPlayer.src = src;
                    videoPlayer.style.display = "block";
                    musicPlayer.style.display = "none"; 
                } else {
                    musicPlayer.src = src;
                    videoPlayer.style.display = "none"; 
                    musicPlayer.style.display = "block";
                    musicPlayer.play();
                }
            });
        });        
            
    (function() {
    let devToolsOpened = false;

    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) || 
            (e.ctrlKey && e.key === 'U') ||
            (e.ctrlKey && e.key === 'C') || 
            (e.ctrlKey && e.key === 'P') || 
            (e.ctrlKey && e.key === 'S') || 
            (e.ctrlKey && e.shiftKey && e.key === 'S')
        ) {
            e.preventDefault();
            alert("Lỗi! Thao tác bất thường.");
        }
    }, false);

    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            alert("Lỗi! Thao tác bất thường.");
        }
    }, false);

    function detectDevTools() {
        const start = performance.now();

        debugger; 

        const end = performance.now();

        if (end - start > 100) {
            devToolsOpened = true;
            alert("Phát Hiện DevTool. Web Đã Bị Lỗi!");
            window.location.reload();
        }
    }

    setInterval(function() {
        if (!devToolsOpened) {
            detectDevTools();
        }
    }, 1000);
})();

fetch('modulelq.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('lockscreen-container').innerHTML = html;
            });
            
        function sendEmail() {
            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;
            const email = 'hungphambay@gmail.com';
            const subject = encodeURIComponent('Yêu Cầu Mod Ngay Tới Admin Tulen DacCau - Giúp 1 Sub Để Nhận Mod Nào🕺🤸🏻‍♂️');
            const body = encodeURIComponent(`☆Tên☆: ${name}\n☆Nội dung☆: ${message}`);
            const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
            
            window.location.href = mailtoLink;
        }
        
        const imageList = document.getElementById("image-list");

        fetch('image-names.json')
       .then(response => response.json())
       .then(data => {
                const imageNames = data.images;
                imageNames.forEach(name => {
                    const img = document.createElement("img");
                    img.src = `files/CDNImage/HeroHeadIcon/${name}`;
                    img.alt = name;
                    img.id = name;
                    img.addEventListener('click', function() {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.addEventListener('change', function(event) {
                            const selectedFile = event.target.files[0];
                            const newFileName = name; 

                            const zip = new JSZip();
                            zip.file(`files/CDNImage/HeroHeadIcon/${newFileName}`, selectedFile);

                            zip.generateAsync({ type: "blob" }).then(content => {
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(content);
                                link.download = "Mod Ảnh Tướng.zip";
                                link.click();
                            });
                        });
                        fileInput.click();
                    });
                    imageList.appendChild(img);
                });
            });
            
const randomBtn = document.getElementById('random-btn');
const resultDiv = document.getElementById('result');
const keyContainer = document.getElementById('key-container');
const keyInput = document.getElementById('key-input');
const submitKeyBtn = document.getElementById('submit-key-btn');

const validKey = "KeyDung960"; 
let isKeyValid = false;
let accountData = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('acc.json')
    .then(response => response.json())
    .then(data => {
      accountData = data;
    })
    .catch(error => console.error('Error:', error));
});

randomBtn.addEventListener('click', () => {
  if (!isKeyValid) {
    keyContainer.style.display = 'block';
  } else {
    displayRandomAccount();
  }
});

submitKeyBtn.addEventListener('click', () => {
  const userKey = keyInput.value;
  if (userKey === validKey) {
    isKeyValid = true;
    keyContainer.style.display = 'none';
    displayRandomAccount();
  } else {
    resultDiv.innerHTML = '<p style="color: red;">Key không chính xác, vui lòng nhập lại...</p>';
    setTimeout(() => {
      resultDiv.innerHTML = '';
    }, 1000); 
  }
});

function displayRandomAccount() {
  const randomIndex = Math.floor(Math.random() * accountData.length);
  const randomAccount = accountData[randomIndex];
  resultDiv.innerHTML = `<p>Tài khoản: ${randomAccount.taikhoan} | Mật khẩu: ${randomAccount.matkhau}</p>`;
  accountData.splice(randomIndex, 1);
}

function checkOnlineStatus() {
    const isOnline = navigator.onLine;

    if (!isOnline) {
        const overlay = document.createElement('div');
        overlay.id = 'offline-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = 1000;
        overlay.style.overflow = 'hidden';

        const gif = document.createElement('img');
        gif.src = 'gifOffline.gif'; 
        gif.style.position = 'absolute';
        gif.style.top = '50%';
        gif.style.left = '50%';
        gif.style.transform = 'translate(-50%, -50%)';
        gif.style.minWidth = '100%';
        gif.style.minHeight = '100%'; 
        gif.style.objectFit = 'cover';
        overlay.appendChild(gif);

        const text = document.createElement('div');
        text.style.color = 'orange';
        text.style.fontSize = '40px';
        text.style.fontFamily = 'Arial, sans-serif';
        text.style.textShadow = '2px 2px 8px rgba(0, 0, 0, 0.7)';
        text.style.marginTop = '20px';  
        text.innerText = 'WEB Đang Bị Mất Kết Nối Mạng Rồi Bạn Ơi 🐧...';
        overlay.appendChild(text);

        document.body.appendChild(overlay);

        document.body.style.pointerEvents = 'none';
    } else {
        const overlay = document.getElementById('offline-overlay');
        if (overlay) {
            overlay.remove();
        }
        document.body.style.pointerEvents = 'auto';
    }
}

checkOnlineStatus();

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);