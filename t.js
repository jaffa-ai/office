document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const waveformContainer = document.getElementById('waveform');
    const skipBackward15 = document.getElementById('skipBackward15');
    const skipBackward30 = document.getElementById('skipBackward30');
    const skipForward15 = document.getElementById('skipForward15');
    const skipForward30 = document.getElementById('skipForward30');

    let wavesurfer;

    function initializeWaveSurfer() {
        if (!waveformContainer) {
            console.error('Waveform container not found');
            return;
        }

        wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: '#c1bfed',
            progressColor: '1c2f50',
            backend: 'MediaElement',
            height: 80,
            barWidth: 2,
            cursorColor: 'navy',
            responsive: true,
            interact: true,
            hideScrollbar: true,
            mediaControls: true,
            media: audioPlayer
        });

        wavesurfer.on('ready', function() {
            console.log('WaveSurfer is ready');
        });

        wavesurfer.on('error', function(e) {
            console.error('WaveSurfer error:', e);
        });
    }

    // Initialize WaveSurfer when the audio is loaded
    audioPlayer.addEventListener('loadedmetadata', initializeWaveSurfer);

    // Skip buttons functionality
    skipBackward15.addEventListener('click', () => {
        audioPlayer.currentTime -= 15;
    });

    skipBackward30.addEventListener('click', () => {
        audioPlayer.currentTime -= 30;
    });

    skipForward15.addEventListener('click', () => {
        audioPlayer.currentTime += 15;
    });

    skipForward30.addEventListener('click', () => {
        audioPlayer.currentTime += 30;
    });


    // Listen for timestamp click events to seek the audio
    document.getElementById('rawTextContent').addEventListener('click', function(event) {
        if (event.target.classList.contains('timestamp')) {
            const timestamp = event.target.getAttribute('data-timestamp');
            const seconds = parseTimestampToSeconds(timestamp);
            audioPlayer.currentTime = seconds;
            audioPlayer.play();  // Start playing from the clicked timestamp
        }
    });

    // Tab switching functionality
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // Hide all tab contents
            tabContents.forEach(content => content.style.display = 'none');
            // Show the clicked tab's content
            tabContents[index].style.display = 'block';
            
            // Handle special actions for specific tabs
            if (tab.id === 'summaryTab') {
                generateSummary();  // Trigger summary generation when Summary tab is clicked
            }
        });
    });

    // Show the first tab by default
    tabContents[0].style.display = 'block';
});

// Function to convert timestamps to seconds
function parseTimestampToSeconds(timestamp) {
    const parts = timestamp.slice(1, -1).split(':'); // Removes the [ ] and splits the minutes and seconds
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

// Update this function to render timestamps as clickable spans
function displayRawTextWithTimestamps(textWithTimestamps) {
    const rawTextContent = document.getElementById('rawTextContent');
    const formattedText = textWithTimestamps.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
    rawTextContent.innerHTML = formattedText;
}

// Function to process PDF and audio files when the "Start" button is clicked
window.startProcessing = function() {
    const pdfInput = document.getElementById('pdfInput');
    const audioInput = document.getElementById('audioInput');

    const pdfFile = pdfInput.files[0];
    const audioFile = audioInput.files[0];

    if (pdfFile && audioFile) {
        // Show loading spinner
        showLoadingSpinner();
        
        // Set up FileReader for audio file
        const reader = new FileReader();
        reader.onload = function(event) {
            // Set the audio source to the uploaded file
            const audioSource = document.getElementById('audioSource');
            audioSource.src = event.target.result;
            audioPlayer.load(); // Reload audio player with new source

            // Call function to upload files
            uploadFiles(pdfFile, audioFile);
        };
        reader.readAsDataURL(audioFile); // Read audio file as data URL
    } else {
        alert('Please upload both an audio file and a PDF file.');
    }
}

// Function to upload PDF and audio files
function uploadFiles(pdfFile, audioFile) {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('audio', audioFile);

    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/process', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                // Server returned an error
                throw new Error(data.error || 'Unknown error');
            }
            return data;
        });
    })
    .then(data => {
        hideLoadingSpinner();

        if (data.corrected_text) {
            displayRawTextWithTimestamps(data.corrected_text);
            switchToResultPage();
        } else if (data.error) {
            console.error('Error fetching raw text:', data.error);
            alert('Error processing files.');
        }
    })
    .catch(error => {
        hideLoadingSpinner();
        console.error('Error:', error.message);
        alert(`An error occurred: ${error.message}`);
    });
}

// Function to show the loading spinner
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Function to hide the loading spinner
function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Function to switch to the result page after processing
function switchToResultPage() {
    document.getElementById('uploadPage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'block';
}

// Function to request a summary from the Flask app
function generateSummary() {
    const rawTextContent = document.getElementById('rawTextContent').textContent.trim();
    const customPromptInput = document.getElementById('customPromptInput');
    const customPrompt = customPromptInput ? customPromptInput.value.trim() : '';

    if (!rawTextContent) {
        alert('No raw text available to summarize.');
        return;
    }

    // Prepare the form data to send in the request
    const formData = new FormData();
    formData.append('text', rawTextContent);
    formData.append('custom_prompt', customPrompt);

    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/summarize', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.summary) {
            displaySummaryWithTimestamps(data.summary);
        } else if (data.error) {
            console.error('Error fetching summary:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to render the summary with clickable timestamps
function displaySummaryWithTimestamps(summaryWithTimestamps) {
    const summaryContent = document.getElementById('summaryContent');
    const formattedSummary = summaryWithTimestamps.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
    summaryContent.innerHTML = formattedSummary;

    // Add event listeners to play audio from the clicked timestamp in the summary
    summaryContent.addEventListener('click', function(event) {
        if (event.target.classList.contains('timestamp')) {
            const timestamp = event.target.getAttribute('data-timestamp');
            const seconds = parseTimestampToSeconds(timestamp);
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.currentTime = seconds;
            audioPlayer.play();  // Start playing from the clicked timestamp
        }
    });
}

// Listen for timestamp click events to seek the audio in all sections
document.querySelectorAll('.tab-content').forEach(tabContent => {
    tabContent.addEventListener('click', function(event) {
        if (event.target.classList.contains('timestamp')) {
            const timestamp = event.target.getAttribute('data-timestamp');
            const seconds = parseTimestampToSeconds(timestamp);
            audioPlayer.currentTime = seconds;
            audioPlayer.play();  // Start playing from the clicked timestamp
        }
    });
});

// Highlight and auto-scroll the text for all sections based on the audio time
audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime;

    // Highlight and auto-scroll in Raw Text, Summary, and Q&A sections
    highlightTextBasedOnTimestamp(currentTime, 'rawTextContent');
    highlightTextBasedOnTimestamp(currentTime, 'summaryContent');
    highlightTextBasedOnTimestamp(currentTime, 'qaContent');
});

// Function to highlight text and scroll into view based on the current audio time
function highlightTextBasedOnTimestamp(currentTime, contentId) {
    const content = document.getElementById(contentId);
    const timestamps = content.querySelectorAll('.timestamp');

    timestamps.forEach((timestamp) => {
        const time = parseTimestampToSeconds(timestamp.getAttribute('data-timestamp'));
        if (Math.abs(currentTime - time) < 2) {  // Check if the current time matches within 2 seconds
            clearHighlight(contentId);  // Clear previous highlights
            timestamp.classList.add('highlight');
            timestamp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Function to clear previous highlights
function clearHighlight(contentId) {
    const content = document.getElementById(contentId);
    const highlighted = content.querySelector('.highlight');
    if (highlighted) {
        highlighted.classList.remove('highlight');
    }
}
function generateQAOneLinerSummary() {
    const rawTextContent = document.getElementById('rawTextContent').textContent.trim();
    
    if (!rawTextContent) {
        alert('No raw text available to summarize.');
        return;
    }

    // Prepare the form data to send in the request
    const formData = new FormData();
    formData.append('text', rawTextContent); // Append the raw text content

    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/qa_one_liner_summary', {
        method: 'POST',
        body: formData, // Send the formData in the request body
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received data:', JSON.stringify(data, null, 2)); // Pretty print the entire received data

        let summaryContent = '';

        if (typeof data === 'object' && data !== null) {
            if (data.final_qa_list) {
                summaryContent = processQAByCategory(data.final_qa_list);
            } else {
                // If final_qa_list doesn't exist, try to parse the data as is
                summaryContent = parseUnknownStructure(data);
            }
        } else {
            console.error('Received data is not an object:', data);
            summaryContent = '<p>Error: Unexpected data type received from the server.</p>';
        }

        const qaContent = document.getElementById('qaContent');
        qaContent.innerHTML = summaryContent;

        addTimestampListeners(); // Ensure to add listeners after content is set
    })
    .catch(error => {
        console.error('Error:', error);
        const qaContent = document.getElementById('qaContent');
        qaContent.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

function processQAByCategory(finalQAList) {
    let content = '';
    for (const [category, data] of Object.entries(finalQAList)) {
        const qaList = data.qa_pairs;
        
        if (Array.isArray(qaList)) {
            qaList.forEach(item => {
                const questionTimestamps = formatTimestamps(item.timestamps_questions);
                const answerTimestamps = formatTimestamps(item.timestamps_answers);

                content += `
                    <div class="category-summary">
                        <h3>${category}</h3>
                        <p><strong>Question:</strong> ${item.question}</p>
                        <p><strong>Question Timestamps:</strong> ${questionTimestamps}</p>
                        <p><strong>Context:</strong> ${item.context}</p>
                        <p><strong>Answer:</strong> ${item.answer}</p>
                        <p><strong>Answer Timestamps:</strong> ${answerTimestamps}</p>
                    </div>
                `;
            });
        } else {
            console.error(`qaList for category ${category} is not an array:`, qaList);
        }
    }
    return content;
}

function parseUnknownStructure(data) {
    let content = '<div class="category-summary">';
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null) {
            content += `<h3>${key}</h3>`;
            content += parseUnknownStructure(value); // Recursively parse nested objects
        } else {
            content += `<p><strong>${key}:</strong> ${value}</p>`;
        }
    }
    content += '</div>';
    return content;
}

function formatTimestamps(timestamps) {
    if (!timestamps) return '';
    const timestampArray = timestamps.match(/\[\d{2}:\d{2}\]/g) || [];
    return timestampArray.map(ts => `<span class="timestamp" data-timestamp="${ts}">${ts}</span>`).join(' ');
}

function addTimestampListeners() {
    document.querySelectorAll('.timestamp').forEach(timestamp => {
        timestamp.addEventListener('click', function() {
            const time = parseTimestampToSeconds(this.getAttribute('data-timestamp'));
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer) {
                audioPlayer.currentTime = time; // Set audio to the time of the clicked timestamp
                audioPlayer.play(); // Start playing the audio
            } else {
                console.error('Audio player not found.');
            }
        });
    });
}

function parseTimestampToSeconds(timestamp) {
    const parts = timestamp.slice(1, -1).split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Add this to your existing event listener setup
document.addEventListener('DOMContentLoaded', function() {
    const generateQAButton = document.getElementById('generateQAButton');
    if (generateQAButton) {
        generateQAButton.addEventListener('click', generateQAOneLinerSummary);
    }
});

// Function to open a tab
function openTab(evt, tabName) {
    // Get all elements with class="tabcontent" and hide them
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablink" and remove the class "active"
    const tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Set the default tab to open
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector(".tablink").click(); // Opens the first tab by default
});


let correctedTextProcessed = false;

function processCorrectedText(correctedText) {
    displayMessage("Processing text...", 'system');
    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/process-corrected-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            corrected_text: correctedText
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Corrected text processed and stored successfully') {
            correctedTextProcessed = true;
            console.log('Corrected text processed successfully');
            displayMessage("Text processed successfully. You can now ask questions.", 'system');
        } else {
            console.error('Error processing corrected text:', data.error);
            displayMessage("Error processing text. Please try again.", 'system');
        }
    })
    .catch(error => {
        console.error('Error processing corrected text:', error);
        displayMessage("Error processing text. Please check your connection and try again.", 'system');
    });
}

function askQuestion(question) {
    displayMessage('system');
    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/ask-question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.response) {
            displayResponse(data.response);
        } else if (data.error) {
            console.error('Error from server:', data.error);
            displayMessage(`Error: ${data.error}`, 'system');
        } else {
            console.error('Unexpected response format:', data);
            displayMessage("Received an unexpected response from the server.", 'system');
        }
    })
    .catch(error => {
        console.error('Error details:', error);
        displayMessage(`An error occurred: ${error.message}. Please try again.`, 'system');
    });
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message === '') {
        return;
    }
    
    displayMessage(message, 'user');
    
    if (!correctedTextProcessed) {
        processCorrectedText(message);
    } else {
        askQuestion(message);
    }
    
    chatInput.value = '';
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerText = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function displayResponse(response) {
    displayMessage(response, 'ai');
}

// No need for DOMContentLoaded event listener since you're using inline onclick

// You may want to add this event listener for pressing Enter in the input field
document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('Text copied to clipboard');
    }).catch(err => {
        alert('Failed to copy text: ', err);
    });
}

// Download text as .txt file
function downloadText(elementId, filename) {
    const text = document.getElementById(elementId).innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
