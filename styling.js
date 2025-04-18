function adjustChatContainerHeight() {
	const windowHeight = window.innerHeight;
	const chatContainer = document.querySelector('.chat-container');
	chatContainer.style.height = `${windowHeight - 20}px`; // Optional offset
  }

  window.addEventListener('load', adjustChatContainerHeight);
  window.addEventListener('resize', adjustChatContainerHeight);

let initialHeight = window.innerHeight;

window.addEventListener('resize', () => {
  const newHeight = window.innerHeight;
  const keyboardIsOpen = newHeight < initialHeight;

  if (keyboardIsOpen) {
	document.body.classList.add('keyboard-open');
  } else {
	document.body.classList.remove('keyboard-open');
  }
});



