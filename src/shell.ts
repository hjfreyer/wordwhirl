(function() {
  // @ts-ignore
  const libLoaded = import(/* webpackChunkName: "app" */ './app.ts');
  const dataLoaded = import(/* webpackChunkName: "data" */ '../words/data/words.json');

  const buttonPressed = new Promise(resolve =>
    document.getElementById('new-game').addEventListener('click', resolve)
  );

  Promise.all([libLoaded, dataLoaded, buttonPressed]).then(([lib, data, button]) => {
    console.log('loaded');
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.parentNode.removeChild(loadingScreen);

    // @ts-ignore
    document.body.appendChild(new lib.MyApp(data));
  });

  document.getElementById('new-game').click();
})();