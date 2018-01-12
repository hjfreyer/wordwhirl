
import x from './dep.js';

function component() {
    var element = document.createElement('div');

    element.innerHTML = 'Hello webpack and '+ x;

    return element;
  }

  document.body.appendChild(component());
