
import {x} from './dep.ts';

function component() {
    var element = document.createElement('div');

    element.innerHTML = 'Hello webpack fffand '+ x;

    return element;
  }

  document.body.appendChild(component());
