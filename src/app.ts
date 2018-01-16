
import '../node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js';
import {x} from './dep.ts';
import './poly.ts';

function component() {
    var element = document.createElement('div');

    element.innerHTML = 'Hello webpack fffand '+ x;

    return element;
  }

  document.body.appendChild(component());
