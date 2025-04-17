 // Function to get query parameters from the URL
        function getRoomNumber() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('room'); // Get the 'room' parameter
        }

        let userRoomNumber = ""; // This will store the room number from the URL

// Function to handle "Send" button or "Enter" key press
function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    
    if (userInput.toLowerCase() === 'hi') {
        let roomNumber = getRoomNumber();
        if (roomNumber) {
            userRoomNumber = roomNumber; // Store the room number
            startChatWithRoom(roomNumber);
        } else {
            const chatBox = document.getElementById('chatBox');
            const botResponse = document.createElement('div');
            botResponse.className = 'bot-message';
            botResponse.innerText = `Please provide your room number to proceed.`;
            chatBox.appendChild(botResponse);
        }
    }

    // Hide the chat input element
    document.getElementById("chatInput").style.display = "none";
}

        // Function to initiate the chat with the room number
        function startChatWithRoom(room) {
            const chatBox = document.getElementById('chatBox');
            const botResponse = document.createElement('div');
            botResponse.className = 'bot-message';
            botResponse.innerText = `How can we assist you?`;
            botResponse.style.fontSize = '18px'; // Increase font size
            chatBox.appendChild(botResponse);

            displayMainMenu();
        }


        // Listen for "Enter" key press to trigger sendMessage function
        document.getElementById("userInput").addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent the default "Enter" key behavior (form submission)
                sendMessage(); // Trigger sendMessage when Enter is pressed
            }
        });
