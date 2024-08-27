let correctedText = ''; // Global variable to store the corrected text

async function uploadFiles() {
    const form = document.getElementById('uploadForm');
    const pdfFile = form.pdfFile.files[0];
    const audioFile = form.audioFile.files[0];
    const output = document.getElementById('output');
    const buttons = form.querySelectorAll('button');

    if (!pdfFile || !audioFile) {
        output.textContent = 'Please select both a PDF and an MP3 file.';
        return;
    }

    // Disable the buttons to prevent multiple submissions
    buttons.forEach(button => button.disabled = true);
    buttons[0].textContent = "Processing...";  // Update button text
    output.textContent = "Generating response, please wait...";

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('audio', audioFile);

    try {
        const response = await fetch('https://audio-transcript-summary.onrender.com/process', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            if (result.corrected_text) {
                correctedText = result.corrected_text; // Store the corrected text
                output.textContent = correctedText;

                // Show the result in Word
                await Word.run(async (context) => {
                    const doc = context.document;
                    const body = doc.body;
                    body.insertText(correctedText, Word.InsertLocation.end);
                    await context.sync();
                });
            } else if (result.error) {
                output.textContent = `Error: ${result.error}`;
            }
        } else {
            output.textContent = `Server error: ${response.statusText} (${response.status})`;
        }
    } catch (error) {
        output.textContent = `Network error: ${error.message}`;
    } finally {
        // Re-enable the buttons and reset text
        buttons.forEach(button => button.disabled = false);
        buttons[0].textContent = "Upload and Process";
    }
}

async function summarize() {
    const output = document.getElementById('output');
    const buttons = document.querySelectorAll('button');

    if (!correctedText) {
        output.textContent = 'Please process the audio file first.';
        return;
    }

    // Disable the buttons to prevent multiple submissions
    buttons.forEach(button => button.disabled = true);
    buttons[1].textContent = "Summarizing...";  // Update button text
    output.textContent = "Generating summary, please wait...";

    const formData = new FormData();
    formData.append('text', correctedText); // Send the corrected text

    try {
        const response = await fetch('https://audio-transcript-summary.onrender.com/summarize', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            if (result.summary) {
                output.textContent = result.summary;

                // Show the result in Word
                await Word.run(async (context) => {
                    const doc = context.document;
                    const body = doc.body;
                    body.insertText(result.summary, Word.InsertLocation.end);
                    await context.sync();
                });
            } else if (result.error) {
                output.textContent = `Error: ${result.error}`;
            }
        } else {
            output.textContent = `Server error: ${response.statusText} (${response.status})`;
        }
    } catch (error) {
        output.textContent = `Network error: ${error.message}`;
    } finally {
        // Re-enable the buttons and reset text
        buttons.forEach(button => button.disabled = false);
        buttons[1].textContent = "Summarize";
    }
}

Office.onReady(async (info) => {
    if (info.host === Office.HostType.Word) {
        // Expose uploadFiles and summarize to the global scope
        window.uploadFiles = uploadFiles;
        window.summarize = summarize;
    }
});
