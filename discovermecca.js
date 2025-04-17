async function discoverMecca() {
    const chatBox = document.getElementById('chatBox');
    
    // Presenting the options for "Discover Mecca"
    const botResponse = document.createElement('div');
    botResponse.className = 'bot-message';
    botResponse.innerText = "Please select a place to discover in Mecca:";
    chatBox.appendChild(botResponse);

    const options = [
        "Maulana Abde Manaf AS", "Maulana Hashim AS", "Maulana Abu Talib AS", "Maulatona Khadija AS", 
        "Jabal al-Nour", "Jabal al-Saur", "Jabal Abi Qubais", "Mina", "Arafah", "Muzdalefah", "Maulid al-Nabi", "Masjid al Kheef"
    ];
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerText = option;
        button.onclick = () => handleDiscoverSelection(option);  // Handle the user's selection
        chatBox.appendChild(button);
    });

    chatBox.scrollTop = chatBox.scrollHeight;

    function handleDiscoverSelection(selection) {
        const userMessage = document.createElement('div');
        userMessage.className = 'user-message';
        userMessage.innerText = selection;
        chatBox.appendChild(userMessage);

        setTimeout(() => {
            showDiscoverImages(selection);
        }, 1000);
    }

    function showDiscoverImages(selection) {
        // Mapping of selection to image filenames
        const imageMap = {
            "Jannatul Ma'ala": ["mala_01.png", "mala_02.png", "mala_03.png", "mala_04.png", "mala_05.png"],
            "Maulana Abde Manaf AS": ["am_01.png", "am_02.png", "am_03.png"],
            "Maulana Hashim AS": ["ha_01.png", "ha_02.png", "ha_03.png"],
            "Maulana Abu Talib AS": ["bt_01.png", "bt_02.png"],
            "Maulana Abdul Muttalib AS": ["at_01.png", "at_02.png", "at_03.png"],
            "Maulatona Khadija AS": ["k_01.png", "k_02.png", "k_03.png"],
            "Jabal al-Nour": ["jn_01.png", "jn_02.png", "jn_03.png", "jn_04.png"],
            "Jabal al-Saur": ["saur_01.png"],
            "Jabal Abi Qubais": ["abi_01.png"],
            "Mina": ["mina_01.png", "mina_02.png", "mina_03.png", "mina_04.png", "mina_05.png"],
            "Arafah": ["ar_01.png", "ar_02.png", "ar_03.png", "ar_04.png"],
            "Muzdalefah": ["mz_01.png", "mz_02.png", "mz_03.png", "mz_04.png", "mz_05.png"],
            "Maulid al-Nabi": ["ghar_01.png", "ghar_02.png", "ghar_03.png"],
            "Masjid al Kheef": ["mk_01.png", "mk_02.png", "mk_03.png"],
            "Jamaraat": ["jm_01.png", "jm_02.png"]
        };

        const images = imageMap[selection];
        
        // Show the 5 images corresponding to the selected option
        images.forEach(image => {
            const imageElement = document.createElement('img');
            imageElement.className = 'image';
            imageElement.src = `${image}`;  // Make sure the path is correct
            chatBox.appendChild(imageElement);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    }
}
