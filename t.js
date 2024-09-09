// Event listeners for switching between tabs

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


document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const waveformContainer = document.getElementById('waveform');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Initialize WaveSurfer.js
    const wavesurfer = WaveSurfer.create({
        container: waveformContainer,
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'MediaElement',
        height: 80,
        barWidth: 2,
        cursorColor: 'navy',
        responsive: true,
        interact: true,
        hideScrollbar: true,
    });

    // Update waveform when audio is loaded
    audioPlayer.addEventListener('loadeddata', () => {
        wavesurfer.load(audioPlayer);
    });

    // Sync play/pause with the audio element controls
    audioPlayer.addEventListener('play', () => wavesurfer.play());
    audioPlayer.addEventListener('pause', () => wavesurfer.pause());

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

// Function to process PDF and audio files
function processFiles() {
    const pdfInput = document.getElementById('pdfInput');
    const audioInput = document.getElementById('audioInput');

    const pdfFile = pdfInput.files[0];
    const audioFile = audioInput.files[0];

    if (pdfFile && audioFile) {
        uploadFiles(pdfFile, audioFile);
    } else {
        alert('Please upload both an audio file and a PDF file.');
    }
}

// Function to upload PDF and audio files
// Function to process PDF and audio files when the "Start" button is clicked
// Function to process PDF and audio files when the "Start" button is clicked
function startProcessing() {
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
            const audioPlayer = document.getElementById('audioPlayer');
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

    fetch('https://audio-transcript-summary-4st9.onrender.com/process', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingSpinner();

        if (data.corrected_text) {
            displayRawTextWithTimestamps(data.corrected_text);  // Display raw text with clickable timestamps
            switchToResultPage();  // Switch to the page with audio player and tabs
        } else if (data.error) {
            console.error('Error fetching raw text:', data.error);
            alert('Error processing files.');
        }
    })
    .catch(error => {
        hideLoadingSpinner();
        console.error('Error:', error);
        alert('An error occurred while uploading files.');
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

// Ensure that when the files are uploaded and the user clicks "Start", the first tab is opened and the player is initialized correctly
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the upload process
    document.getElementById('startBtn').addEventListener('click', startProcessing);
});



// Function to request a summary from the Flask app
function generateSummary() {
    const rawTextContent = document.getElementById('rawTextContent').textContent.trim();
    const customPromptInput = document.getElementById('customPromptInput'); // Optional input for custom prompt
    const customPrompt = customPromptInput ? customPromptInput.value.trim() : '';

    if (!rawTextContent) {
        alert('No raw text available to summarize.');
        return;
    }

    // Prepare the form data to send in the request
    const formData = new FormData();
    formData.append('text', rawTextContent);
    formData.append('custom_prompt', customPrompt);

    fetch('https://audio-transcript-summary-4st9.onrender.com/summarize', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.summary) {
            displaySummaryWithTimestamps(data.summary); // Display summary with clickable timestamps
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
    fetch('/qa_one_liner_summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),  // Add any required data here
    })
    .then(response => response.json())
    .then(data => {
        // Assuming the response has 'one_liner_summary_by_cat'
        const summary = data.one_liner_summary_by_cat;
        
        // Display the one-liner summary in the Q&A tab
        const qaContent = document.getElementById('qaContent');
        qaContent.innerHTML = `<p>${summary}</p>`;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Add this function to the Q&A button's click event listener
document.getElementById('generateQAButton').addEventListener('click', generateQAOneLinerSummary);

function fetchAndDisplayQA() {
    fetch('http://127.0.0.1:5000/performance')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data); // Debugging statement
            let htmlContent = '';
            for (const category in data) {
                htmlContent += `<div class="qa-category"><h3>${category}</h3>`;
                for (const question in data[category]) {
                    const answer = data[category][question];
                    htmlContent += `<p>${question} <span class="timestamp" data-timestamp="[[${extractTimestamp(question)}]]">[[${extractTimestamp(question)}]]</span>: ${answer}</p>`;
                }
                htmlContent += '</div>';
            }
            qaContent.innerHTML = htmlContent;

            // Add event listeners to timestamps in Q&A
            qaContent.querySelectorAll('.timestamp').forEach(element => {
                element.addEventListener('click', function() {
                    const timestamp = element.getAttribute('data-timestamp');
                    const seconds = parseTimestampToSeconds(timestamp);
                    const audioPlayer = document.getElementById('audioPlayer');
                    audioPlayer.currentTime = seconds;
                    audioPlayer.play();  // Start playing from the clicked timestamp
                    highlightTimestampInRawText(timestamp); // Highlight in raw text
                });
            });
        })
        .catch(error => {
            console.error('Error fetching Q&A:', error);
        });
}
