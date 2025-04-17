// Adjust the chat container height based on the device's actual viewport height
function adjustChatContainerHeight() {
    const windowHeight = window.innerHeight;  // Get the inner height of the window (this excludes the browser UI)
    const chatContainer = document.querySelector('.chat-container');

    // Set the height of the chat container to the inner height of the viewport minus any space for the header
    chatContainer.style.height = `${windowHeight - 20}px`; // 20px can be adjusted based on your desired padding
}