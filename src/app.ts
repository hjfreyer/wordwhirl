
import '../node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js';
import {x} from './dep.ts';
import './poly.ts';

function component() {
    var element = document.createElement('div');

    element.innerHTML = 'Hello webpack fffand '+ x;

    import(/* webpackChunkName: "data" */ '../words/data/words.json').then(module => {
      console.log('promise');
      console.log( module);
}     );
    return element;
  }

  document.body.appendChild(component());
