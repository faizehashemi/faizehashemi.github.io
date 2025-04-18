function askForMansakConfirmation() {
    const chatBox = document.getElementById('chatBox');
    
    // Ask for confirmation
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "Do you want to download the Makkah and Umrah PDFs? (Yes / No)";
    chatBox.appendChild(botResponse);

    const buttonMenu = document.createElement('div');
    buttonMenu.className = 'button-menu';

    const buttons = [];

    const yesButton = document.createElement('button');
    yesButton.className = 'menu-button';
    yesButton.innerText = "Yes, download PDFs";
    buttons.push(yesButton);

    const noButton = document.createElement('button');
    noButton.className = 'menu-button';
    noButton.innerText = "No, I don't need them";
    buttons.push(noButton);

    buttonMenu.appendChild(yesButton);
    buttonMenu.appendChild(noButton);

    chatBox.appendChild(buttonMenu);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Add bubble effect to buttons
    enableBubbleEffectOnClick(buttons, (text) => {
        if (text === "Yes, download PDFs") {
            downloadMansakPDFs();
            setTimeout(() => {
                location.reload(); // Refresh the page after 5 seconds
            }, 5000);
        } else {
            const cancelResponse = document.createElement('div');
            cancelResponse.className = 'bot-message';
            cancelResponse.innerText = "Okay, we won't download the PDFs.";
            chatBox.appendChild(cancelResponse);
            chatBox.scrollTop = chatBox.scrollHeight;
             setTimeout(() => {
                location.reload(); // Refresh the page after 5 seconds
            }, 5000);
        }
    });
}


    function downloadMansakPDFs() {
        const chatBox = document.getElementById('chatBox');

        // Create a bot message to inform about the download
        const botResponse = document.createElement('div');
        botResponse.className = 'bot-message';
        botResponse.innerText = "Starting download of Makkah and Umrah PDFs...";
        chatBox.appendChild(botResponse);

        // Create a download link for both PDFs
        const linkMakkah = document.createElement('a');
        linkMakkah.href = 'makkah.pdf'; // Replace with the actual path to the Makkah PDF
        linkMakkah.download = 'makkah.pdf';


        // Trigger the downloads by clicking both links programmatically
        linkMakkah.click();
  

        // Provide feedback after download
        setTimeout(() => {
            const successMessage = document.createElement('div');
            successMessage.className = 'bot-message';
            successMessage.innerText = "Both PDFs have been successfully downloaded to your device.";
            chatBox.appendChild(successMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 2000);
    }