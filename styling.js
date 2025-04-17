function adjustChatContainerHeight() {
    const windowHeight = window.innerHeight;
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.style.height = `${windowHeight - 20}px`; // Optional offset
  }

  window.addEventListener('load', adjustChatContainerHeight);
  window.addEventListener('resize', adjustChatContainerHeight);