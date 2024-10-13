document.addEventListener('DOMContentLoaded', function() {



    window.fetchOpeningRemarksSummary = function() {
        const rawTextContent = document.getElementById('rawTextContent').textContent.trim();
        const companyName = document.getElementById('companyName').value.trim();
        const quarter = document.getElementById('quarter').value.trim();

        if (!companyName || !quarter) {
            alert('Please select both a company and a quarter.');
            return;
        }

        const formData = new FormData();
        formData.append('text', rawTextContent);
        formData.append('company_name', companyName);
        formData.append('quarter', quarter);

        fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/opening_remarks_summary', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.summary) {
                displayOneLinerSummary(data.summary);
            } else if (data.error) {
                console.error('Error fetching summary:', data.error);
                alert('Error fetching summary.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching the summary.');
        });
    };

    // Function to fetch and display the Q&A summary
    window.fetchQASummary = function() {
        const rawTextContent = document.getElementById('rawTextContent').textContent.trim();
        const companyName = document.getElementById('companyName').value.trim();
        const quarter = document.getElementById('quarter').value.trim();

        if (!companyName || !quarter) {
            alert('Please select both a company and a quarter.');
            return;
        }

        const formData = new FormData();
        formData.append('text', rawTextContent);
        formData.append('company_name', companyName);
        formData.append('quarter', quarter);

        fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/qa_summary', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.summary) {
                displayOneLinerSummary(data.summary);
            } else if (data.error) {
                console.error('Error fetching summary:', data.error);
                alert('Error fetching summary.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching the summary.');
        });
    };


    // Function to display the one-liner summary with checkboxes and clickable timestamps
    window.displayOneLinerSummary = function(summary) {
        const oneLinerSummaryContent = document.getElementById('oneLinerSummaryContent');
        const lines = summary.split('\n');
        let content = '';
 
 
        let currentCategory = '';
 
    lines.forEach(line => {
        if (line.startsWith('##')) {
            if (currentCategory) {
                content += `</div>`; // Close previous category div
            }
            currentCategory = line.substring(2).trim();
            content += `
                <div class="category-summary">
                    <h3>
                        <input type="checkbox" class="category-checkbox"> ${currentCategory}
                    </h3>
            `;
        } else if (line.startsWith('-')) {
            const formattedLine = line.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
    content += `
        <div>
            <input type="checkbox" class="one-liner-checkbox" data-content="${line.trim()}">
            ${formattedLine.trim().substring(1).trim()} <!-- Remove the dash -->
        </div>
        <br>
    `;
        }
    });
         
 
        oneLinerSummaryContent.innerHTML = content;
        addCategoryCheckboxListeners(); // Attach listeners to category checkboxes
 
 
        // Add event listeners to play audio from the clicked timestamp
        oneLinerSummaryContent.querySelectorAll('.timestamp').forEach(el => {
            el.addEventListener('click', function() {
                const timestamp = this.getAttribute('data-timestamp');
                const seconds = parseTimestampToSeconds(timestamp);
                const audioPlayer = document.getElementById('audioPlayer');
                audioPlayer.currentTime = seconds;
                audioPlayer.play();
            });
        });
    };
 
    // Function to parse timestamp to seconds
    window.parseTimestampToSeconds = function(timestamp) {
        const parts = timestamp.slice(1, -1).split(':'); // Removes the [ ] and splits the minutes and seconds
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        return minutes * 60 + seconds;
    };
 
    // Function to copy selected one-liner summaries
    window.copySelectedOneLiners = function() {
        const selectedItems = document.querySelectorAll('.one-liner-checkbox:checked');
        let textToCopy = '';
        selectedItems.forEach(item => {
            textToCopy += item.dataset.content + '\n';
        });
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Copied to clipboard!');
        });
    };
 
    // Function to download selected one-liner summaries
    window.downloadSelectedOneLiners = function() {
        const selectedItems = document.querySelectorAll('.one-liner-checkbox:checked');
        let textToDownload = '';
        selectedItems.forEach(item => {
            textToDownload += item.dataset.content + '\n';
        });
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'selected_one_liners.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    };














    const audioPlayer = document.getElementById('audioPlayer');
    const waveformContainer = document.getElementById('waveform');
    const skipBackward15 = document.getElementById('skipBackward15');
    const skipBackward30 = document.getElementById('skipBackward30');
    const skipForward15 = document.getElementById('skipForward15');
    const skipForward30 = document.getElementById('skipForward30');

    let wavesurfer;

    // Function to initialize WaveSurfer
   function  initializeWaveSurfer(){
        if (!waveformContainer) {
            console.error('Waveform container not found');
            return;
        }
    

        wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: '#c1bfed',
            progressColor: '#1c2f50',
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
    // audioPlayer.addEventListener('loadedmetadata', function() {
    //     console.log('loadedmetadata event fired');
    //     initializeWaveSurfer();
    // });
    audioPlayer.addEventListener('loadedmetadata', initializeWaveSurfer);


    // Alternative: Initialize WaveSurfer when the audio can play
    // audioPlayer.addEventListener('canplay', function() {
    //     console.log('canplay event fired');
    //     initializeWaveSurfer();
    // });

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
    const tabs = document.querySelectorAll('.tablink');
    const tabContents = document.querySelectorAll('.tabcontent');
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

window.startProcessing = function() {
    const companyNameInput = document.getElementById('companyName');
    const quarterInput = document.getElementById('quarter');

    const companyName = companyNameInput.value.trim();
    const quarter = quarterInput.value.trim();

    if (companyName && quarter) {
        // Show loading spinner
        showLoadingSpinner();

        // Prepare the form data to send in the request
        const formData = new FormData();
        formData.append('company_name', companyName);
        formData.append('quarter', quarter);

        fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/process', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Response received:', response); // Debugging statement
            return response.json().then(data => {
                if (!response.ok) {
                    // Server returned an error
                    throw new Error(data.error || 'Unknown error');
                }
                return data;
            });
        })
        .then(data => {
            console.log('Data received:', data); // Debugging statement
            hideLoadingSpinner();

            if (data.corrected_text && data.audio_file) {
                displayRawTextWithTimestamps(data.corrected_text);
                setAudioSource(data.audio_file);
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
    } else {
        alert('Please enter both a company name and a quarter.');
    }
}

// Function to set the audio source and initialize WaveSurfer
// window.setAudioSource = function(encodedAudio) {
//     console.log('Setting audio source with encoded data'); // Debugging statement
//     const audioSource = document.getElementById('audioSource');
//     const audioBlob = iso88591ToBlob(encodedAudio, 'audio/mp3');
//     const audioUrl = URL.createObjectURL(audioBlob);
//     audioSource.src = audioUrl;
//     audioPlayer.load(); // Reload audio player with new source

//     // Initialize WaveSurfer with the new audio source
//     //initializeWaveSurfer();
// }

// // Function to convert ISO-8859-1 encoded string to Blob
// window.iso88591ToBlob = function(encoded, mime) {
//     const byteCharacters = Array.from(encoded).map(char => char.charCodeAt(0));
//     const byteArray = new Uint8Array(byteCharacters);
//     return new Blob([byteArray], { type: mime });
// }

window.setAudioSource = function(encodedAudio) {
    console.log('Setting audio source with encoded data'); // Debugging statement
    const audioSource = document.getElementById('audioSource');

    // Decode base64 to binary string
    const binaryString = atob(encodedAudio);

    // Convert binary string to array buffer
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the array buffer
    const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });

    // Create a URL for the Blob and set it as the audio source
    const audioUrl = URL.createObjectURL(audioBlob);
    audioSource.src = audioUrl;
    audioPlayer.load(); // Reload audio player with new source

    // Initialize WaveSurfer with the new audio source
    // initializeWaveSurfer();
}

// Function to convert ISO-8859-1 encoded string to Blob
window.iso88591ToBlob = function(encoded, mime) {
    const byteCharacters = Array.from(encoded).map(char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteCharacters);
    return new Blob([byteArray], { type: mime });
}

// Function to convert timestamps to seconds
window.parseTimestampToSeconds = function(timestamp) {
    const parts = timestamp.slice(1, -1).split(':'); // Removes the [ ] and splits the minutes and seconds
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

// Update this function to render timestamps as clickable spans
window.displayRawTextWithTimestamps = function(textWithTimestamps) {
    const rawTextContent = document.getElementById('rawTextContent');
    const formattedText = textWithTimestamps.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
    rawTextContent.innerHTML = formattedText;


}

// Function to show the loading spinner
window.showLoadingSpinner = function() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

// Function to hide the loading spinner
window.hideLoadingSpinner = function() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Function to switch to the result page after processing
window.switchToResultPage = function() {
    document.getElementById('uploadPage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'block';
}

// Function to request a summary from the Flask app
window.generateSummary = function() {
    const rawTextContent = document.getElementById('rawTextContent').textContent.trim();
    const customPromptInput = document.getElementById('customPromptInput');
    const customPrompt = customPromptInput ? customPromptInput.value.trim() : '';
    const fewShotsInput = document.getElementById('fewShotsInput');
    const fewShots = fewShotsInput ? fewShotsInput.value.trim() : '';
    const companyNameInput = document.getElementById('companyName');
    const quarterInput = document.getElementById('quarter');

    const companyName = companyNameInput.value.trim();
    const quarter = quarterInput.value.trim();

    

    if (!rawTextContent) {
        alert('No raw text available to summarize.');
        return;
    }

    // Prepare the form data to send in the request
    const formData = new FormData();
    formData.append('text', rawTextContent);
    formData.append('custom_prompt', customPrompt);
    formData.append('company_name', companyName);
    formData.append('quarter', quarter);
    if (fewShots) {
        formData.append('few_shots', fewShots);
    }

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

window.toggleFewShots = function() {
    const container = document.getElementById('fewShotsContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

// Function to render the summary with clickable timestamps
window.displaySummaryWithTimestamps = function(summaryWithTimestamps) {
    const summaryContent = document.getElementById('summaryContent');
    const formattedSummary = summaryWithTimestamps.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
    const lines = formattedSummary.split('\n'); // Split the summary into lines
    summaryContent.innerHTML = ''; // Clear previous content

    // Function to display each line with a delay
    function displayLineByLine(index) {
        if (index < lines.length) {
            summaryContent.innerHTML += lines[index] + '<br>';
            setTimeout(() => displayLineByLine(index + 1), 100); // Adjust the delay as needed
        }
    }

    displayLineByLine(0); // Start displaying lines

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
//     const summaryContent = document.getElementById('summaryContent');
//     const formattedSummary = summaryWithTimestamps.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
//     summaryContent.innerHTML = formattedSummary;

//     // Add event listeners to play audio from the clicked timestamp in the summary
//     summaryContent.addEventListener('click', function(event) {
//         if (event.target.classList.contains('timestamp')) {
//             const timestamp = event.target.getAttribute('data-timestamp');
//             const seconds = parseTimestampToSeconds(timestamp);
//             const audioPlayer = document.getElementById('audioPlayer');
//             audioPlayer.currentTime = seconds;
//             audioPlayer.play();  // Start playing from the clicked timestamp
//         }
//     });




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
window.highlightTextBasedOnTimestamp = function(currentTime, contentId) {
    const content = document.getElementById(contentId);
    const timestamps = content.querySelectorAll('.timestamp');
    const rawTextContent = document.getElementById('rawTextContent').textContent.trim();

    timestamps.forEach((timestamp) => {
        const time = parseTimestampToSeconds(timestamp.getAttribute('data-timestamp'));
        if (Math.abs(currentTime - time) < 2) {  // Check if the current time matches within 2 seconds
            clearHighlight(contentId);  // Clear previous highlights

            // Get the text node containing the timestamp
            const textNode = timestamp.parentNode;
            const textContent = textNode.textContent;

            // Find the position of the timestamp in the text
            const timestampIndex = textContent.indexOf(timestamp.textContent);

            // Calculate the start and end indices for highlighting
            const start = Math.max(0, timestampIndex - 100);
            const end = Math.min(textContent.length, timestampIndex + timestamp.textContent.length + 100);

            // Highlight the range
            const highlightedText = textContent.substring(start, end);
            const beforeHighlight = textContent.substring(0, start);
            const afterHighlight = textContent.substring(end);

            // Update the text node with highlighted content
            textNode.innerHTML = `${beforeHighlight}<span class="highlight">${highlightedText}</span>${afterHighlight}`;

            // Reattach event listeners to timestamps
            addTimestampListeners();

            // Scroll the highlighted text into view
            textNode.querySelector('.highlight').scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Remove highlight after 5 seconds
            setTimeout(() => {
                clearHighlight(contentId);
                displayRawTextWithTimestamps(rawTextContent);

                addTimestampListeners(); // Reattach listeners after clearing highlight
            }, 5000);
        }
    });
}

// Function to clear previous highlights
window.clearHighlight = function(contentId) {
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

        let qaContent = '';
        let OnesummaryContent = '';

        if (data && data.one_liner_summary_by_cat) {
            // Process Q&A and summaries by category
            qaContent = processQAByCategory(data.one_liner_summary_by_cat);
            OnesummaryContent = processSummaryByCategory(data.one_liner_summary_by_cat); // FIXED this part
        } else {
            console.error('Received data does not match expected structure:', data);
            qaContent = '<p>Error: Unexpected data structure received.</p>';
            OnesummaryContent = '<p>Error: Unexpected data structure received.</p>';
        }

        // Populate the Q&A and One-Liner Summary sections
        document.getElementById('qaContent').innerHTML = qaContent;
        document.getElementById('OnesummaryContent').innerHTML = OnesummaryContent; // FIXED this part

        addTimestampListeners(); // Add listeners after content is set
        addDownloadCheckboxListeners(); // Add download checkbox listeners
    })
    .catch(error => {
        console.error('Error:', error);
        const qaContent = document.getElementById('qaContent');
        qaContent.innerHTML = `<p>Error: ${error.message}</p>`;
        document.getElementById('OnesummaryContent').innerHTML = `<p>Error: ${error.message}</p>`; // FIXED this part
    });
}

function processQAByCategory(oneLinerSummaryByCat) {
    let content = '';
    for (const [category, data] of Object.entries(oneLinerSummaryByCat)) {
        const qaList = data.qa_pairs;

        // Add category header and checkbox for download
        content += `
            <div class="category-summary">
                <input type="checkbox" class="category-checkbox" data-category="${category}">
                <h3>${category}</h3>
        `;

        if (Array.isArray(qaList)) {
            qaList.forEach(item => {
                const questionTimestamps = formatTimestamps(item.timestamps_questions);
                const answerTimestamps = formatTimestamps(item.timestamps_answers);

                content += `
                    <div class="qa-item">
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

        content += '</div>'; // Close category-summary div
    }
    return content;
}

function processSummaryByCategory(oneLinerSummaryByCat) {
    let content = '';
    for (const [category, data] of Object.entries(oneLinerSummaryByCat)) {
        const oneLineSummary = data.one_line_summary || 'No summary available';
        
        // Split the one-liner summary into points
        const points = oneLineSummary.split('-').filter(point => point.trim() !== '');
        
        // Add category header
        content += `
            <div class="category-summary">
                <input type="checkbox" class="category-checkbox" data-category="${category}">
                <h3>${category}</h3>
                <p><strong>One-Line Summary:</strong></p>
                <ul>
        `;
        
        // Add each point as a list item
        points.forEach(point => {
            content += `<li>${point.trim()}</li>`;
        });
        
        // Close the list and category-summary div
        content += `
                </ul>
            </div>
        `;
    }
    return content;
}

// Format timestamps for audio controls
function formatTimestamps(timestamps) {
    const timestampArray = timestamps.replace(/[\[\]]/g, '').split(',');
    return timestampArray.map(ts => `
        <span class="timestamp" data-timestamp="${ts.trim()}">${ts.trim()}</span>
    `).join(', ');
}

// Add listeners for timestamps
function addTimestampListeners() {
    document.querySelectorAll('.timestamp').forEach(el => {
        el.addEventListener('click', function () {
            const timestamp = parseTime(this.dataset.timestamp);
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer) {
                audioPlayer.currentTime = timestamp;
                audioPlayer.play();
            }
        });
    });
}

// Convert timestamp format [MM:SS] to seconds
function parseTime(timestamp) {
    const parts = timestamp.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

// Add checkbox listeners for download
function addDownloadCheckboxListeners() {
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const selectedCategory = this.dataset.category;
            if (this.checked) {
                console.log(`Selected category for download: ${selectedCategory}`);
                // You can add logic here to trigger the download of the selected category
            }
        });
    });
}

function addDownloadCheckboxListeners() {
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const selectedCategory = this.dataset.category;
            if (this.checked) {
                console.log(`Selected category for download: ${selectedCategory}`);

                // Find the content of the selected category
                const categoryDiv = this.closest('.category-summary'); // Find the parent div with category content
                const categoryContent = categoryDiv.innerText; // Get the entire category content as plain text

                // Trigger the download for the selected category
                const filename = `${selectedCategory}_content.txt`;
                downloadCategoryContent(categoryContent, filename);
            }
        });
    });
}

// Function to trigger the download with a specific name
function downloadCategoryContent(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href); // Clean up the object URL after the download
}


// Utility functions for copying and downloading text
function copyText(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

function downloadText(elementId, filename) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
// Event listener for the Generate Q&A button
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
    const rawTextContent = document.getElementById('rawTextContent').textContent.trim();
    const message = chatInput.value.trim();
    
    if (message === '') {
        return;
    }
    
    displayMessage(message, 'user');
    
    if (!correctedTextProcessed) { 
        processCorrectedText(rawTextContent);
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

window.onload = function() {
    fetchDefaultPrompt();
    initializePage();
};

// Function to fetch the default prompt from the Flask backend
let isDefaultPromptShown = false; // Track if the default prompt is displayed

// Function to toggle visibility of the default prompt
function toggleDefaultPrompt() {
    const defaultPromptContainer = document.getElementById('defaultPromptContainer');
    const showBtn = document.getElementById('showDefaultPromptBtn');
    
    if (!isDefaultPromptShown) {
        // Fetch and show the default prompt only if it has not been shown yet
        fetchDefaultPrompt();
        defaultPromptContainer.style.display = 'block';
        showBtn.innerText = 'Hide Instructions';
        isDefaultPromptShown = true;
    } else {
        // Hide the default prompt if it is already shown
        defaultPromptContainer.style.display = 'none';
        showBtn.innerText = 'Instructions';
        isDefaultPromptShown = false;
    }
}

// Function to fetch the default prompt from the Flask backend
function fetchDefaultPrompt() {
    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/default-prompt')
        .then(response => response.json())
        .then(data => {
            // Set the default prompt in the display area
            document.getElementById('defaultPromptDisplay').innerText = data.default_prompt;
            // Also set it as the value in the hidden textarea for later editing
            document.getElementById('customPromptInput').value = data.default_prompt;
        })
        .catch(error => console.error('Error fetching default prompt:', error));
}

// Enable customization: show the textarea and save/cancel buttons
function enableCustomization() {
    document.getElementById('defaultPromptContainer').style.display = 'none';
    document.getElementById('customPromptContainer').style.display = 'block';
}

// Save the customized prompt and switch back to display mode
function saveCustomPrompt() {
    const customPrompt = document.getElementById('customPromptInput').value;
    document.getElementById('defaultPromptDisplay').innerText = customPrompt;
    document.getElementById('defaultPromptContainer').style.display = 'block';
    document.getElementById('customPromptContainer').style.display = 'none';
}

// Cancel customization: discard changes and switch back to display mode
function cancelCustomization() {
    document.getElementById('customPromptContainer').style.display = 'none';
    document.getElementById('defaultPromptContainer').style.display = 'block';
}
document.addEventListener('DOMContentLoaded', function() {
    const generateQAButton = document.getElementById('generateQAButton');
    if (generateQAButton) {
        generateQAButton.addEventListener('click', generateQAOneLinerSummary);
    }

    document.getElementById('copySelected').addEventListener('click', copySelectedItems);
    document.getElementById('downloadSelected').addEventListener('click', downloadSelectedItems);
    document.getElementById('downloadFull').addEventListener('click', downloadFullContent);
});

document.addEventListener('DOMContentLoaded', function() {
    const generateQAButton = document.getElementById('generateQAButton');
    if (generateQAButton) {
        generateQAButton.addEventListener('click', generateQAOneLinerSummary);
    }

    document.getElementById('copySelected').addEventListener('click', copySelectedItems);
    document.getElementById('downloadSelected').addEventListener('click', downloadSelectedItems);
    document.getElementById('downloadFull').addEventListener('click', downloadFullContent);
});

/////////////////sdsfddddddddddddddddddddddddd

function generateQAOneLinerSummary() {
    const rawTextContent = document.getElementById('rawTextContent').textContent.trim();

    if (!rawTextContent) {
        alert('No raw text available to summarize.');
        return;
    }

    const formData = new FormData();
    formData.append('text', rawTextContent);

    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/qa_one_liner_summary', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received data:', JSON.stringify(data, null, 2));

        let qaContent = '';
        let oneLinerSummaryContent = '';

        if (data && data.one_liner_summary_by_cat) {
            qaContent = processQAByCategory(data.one_liner_summary_by_cat);
            oneLinerSummaryContent = processSummaryByCategory(data.one_liner_summary_by_cat);
        } else {
            console.error('Received data does not match expected structure:', data);
            qaContent = '<p>Error: Unexpected data structure received.</p>';
            oneLinerSummaryContent = '<p>Error: Unexpected data structure received.</p>';
        }

        document.getElementById('qaItems').innerHTML = qaContent;
        document.getElementById('oneLinerSummaryItems').innerHTML = oneLinerSummaryContent;

        addTimestampListeners();
        addDownloadCheckboxListeners();
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('qaItems').innerHTML = `<p>Error: ${error.message}</p>`;
        document.getElementById('oneLinerSummaryItems').innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

function processQAByCategory(oneLinerSummaryByCat) {
    let content = '';
    for (const [category, data] of Object.entries(oneLinerSummaryByCat)) {
        const qaList = data.qa_pairs;

        content += `
            <div class="category-summary">
                <h4>${category}</h4>
        `;

        if (Array.isArray(qaList)) {
            qaList.forEach(item => {
                const questionTimestamps = formatTimestamps(item.timestamps_questions);
                const answerTimestamps = formatTimestamps(item.timestamps_answers);

                content += `
                    <div class="qa-item">
                        <input type="checkbox" class="qa-checkbox" data-category="${category}" data-type="qa" data-content="${item.question} ${item.answer}">
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

        content += '</div>';
    }
    return content;
}

function processSummaryByCategory(oneLinerSummaryByCat) {
    let content = '';
    for (const [category, data] of Object.entries(oneLinerSummaryByCat)) {
        const oneLineSummary = data.one_line_summary || 'No summary available';
        const points = oneLineSummary.split('-').filter(point => point.trim() !== '');

        content += `
            <div class="category-summary">
                <h4>${category}</h4>
                <p><strong>One-Line Summary:</strong></p>
                <ul>
        `;

        points.forEach(point => {
            content += `
                <li>
                    <input type="checkbox" class="summary-checkbox" data-category="${category}" data-type="summary" data-content="${point.trim()}">
                    ${point.trim()}
                </li>
            `;
        });

        content += `
                </ul>
            </div>
        `;
    }
    return content;
}

function formatTimestamps(timestamps) {
    const timestampArray = timestamps.replace(/[\[\]]/g, '').split(',');
    return timestampArray.map(ts => `
        <span class="timestamp" data-timestamp="${ts.trim()}">${ts.trim()}</span>
    `).join(', ');
}

function addTimestampListeners() {
    document.querySelectorAll('.timestamp').forEach(el => {
        el.addEventListener('click', function () {
            const timestamp = parseTime(this.dataset.timestamp);
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer) {
                audioPlayer.currentTime = timestamp;
                audioPlayer.play();
            }
        });
    });
}

function parseTime(timestamp) {
    const parts = timestamp.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

function addDownloadCheckboxListeners() {
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const selectedCategory = this.dataset.category;
            if (this.checked) {
                console.log(`Selected category for download: ${selectedCategory}`);
                const categoryDiv = this.closest('.category-summary');
                const categoryContent = categoryDiv.innerText;
                const filename = `${selectedCategory}_content.txt`;
                downloadCategoryContent(categoryContent, filename);
            }
        });
    });
}

function copySelectedItems() {
    const selectedItems = document.querySelectorAll('.qa-checkbox:checked, .summary-checkbox:checked');
    let textToCopy = '';
    selectedItems.forEach(item => {
        textToCopy += item.dataset.content + '\n';
    });
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Copied to clipboard!');
    });
}

function downloadSelectedItems() {
    const selectedItems = document.querySelectorAll('.qa-checkbox:checked, .summary-checkbox:checked');
    let textToDownload = '';
    selectedItems.forEach(item => {
        textToDownload += item.dataset.content + '\n';
    });
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'selected_content.txt';
    link.click();
    URL.revokeObjectURL(link.href);
}

function downloadFullContent() {
    const qaContent = document.getElementById('qaItems').innerText;
    const oneLinerSummaryContent = document.getElementById('oneLinerSummaryItems').innerText;
    const fullContent = qaContent + '\n\n' + oneLinerSummaryContent;
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'full_content.txt';
    link.click();
    URL.revokeObjectURL(link.href);
}


function addCategoryCheckboxListeners() {
    document.querySelectorAll('.category-checkbox').forEach(categoryCheckbox => {
        categoryCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            const categoryDiv = this.closest('.category-summary');
            categoryDiv.querySelectorAll('.one-liner-checkbox').forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
    });
}

function displayRawTextWithTimestamps(textWithTimestamps) {
    const rawTextContent = document.getElementById('rawTextContent');
    const formattedText = textWithTimestamps.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
    rawTextContent.innerHTML = formattedText;

    // Attach event listeners to timestamps
    addTimestampListeners();
}



// Function to format text with clickable timestamps
function formatTextWithTimestamps(text) {
    return text.replace(/\[(\d{2}:\d{2})\]/g, '<span class="timestamp" data-timestamp="[$1]">[$1]</span>');
}

function parseTimestampToSecond(timestamp) {
    const parts = timestamp.slice(1, -1).split(':'); // Removes the [ ] and splits the minutes and seconds
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
}

function initializePage() {
    // Your initialization code here
    console.log('Page has loaded. Initializing...');

    // Example: Fetch available options for dropdowns
    fetchAvailableOptions();
}

function fetchAvailableOptions() {
    fetch('https://audiotranscriptsummarizer-a7erbkb8ftbmdghf.eastus-01.azurewebsites.net/get_available_options')
        .then(response => response.json())
        .then(data => {
            populateDropdown('companyName', data.companies);
            populateDropdown('quarter', data.quarters);
        })
        .catch(error => {
            console.error('Error fetching options:', error);
            alert('Failed to load options. Please try again later.');
        });
}

function populateDropdown(dropdownId, options) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ''; // Clear existing options
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
    });
}