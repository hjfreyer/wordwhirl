(function() {
  const libLoaded = new Promise(resolve =>
    document.getElementById('app-script').addEventListener('load', resolve)
  );

  const buttonPressed = new Promise(resolve =>
    document.getElementById('new-game').addEventListener('click', resolve)
  );

  Promise.all([libLoaded, buttonPressed]).then(() => {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.parentNode.removeChild(loadingScreen);
    document.body.appendChild(document.createElement('ww-app'));
  });


  document.getElementById('new-game').click();
})();
