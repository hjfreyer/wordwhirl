(function() {
  const libLoaded = import(/* webpackChunkName: "app" */ './app.ts');
  const dataLoaded = import(/* webpackChunkName: "data" */ '../words/data/words.json');

  const buttonPressed = new Promise(resolve =>
    document.getElementById('new-game').addEventListener('click', resolve)
  );

  Promise.all([libLoaded, dataLoaded, buttonPressed]).then(() => {
    console.log('loaded');
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.parentNode.removeChild(loadingScreen);
    document.body.appendChild(document.createElement('ww-app'));
  });

  document.getElementById('new-game').click();
})();
