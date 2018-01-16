
import '../node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js';
import {x} from './dep.ts';
import './poly.ts';
import w from '../words/data/words.json';

function component() {
    var element = document.createElement('div');

    element.innerHTML = 'Hello webpack fffand '+ x;

    return element;
  }

console.log(w);
  document.body.appendChild(component());
