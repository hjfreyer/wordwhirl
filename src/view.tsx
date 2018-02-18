import * as state from './state';
import * as t from './types';
import * as Rx from 'rxjs'

import * as React from "react";
export interface DomBag {
	h1: Element;
	
}

export function getDom(v: state.View, fire: t.Handler<state.Action>) : [JSX.Element, Promise<DomBag>] {
	let rf;
	let p = new Promise<Element>((resolve, reject) => rf = resolve);
	
	return [<h1 ref={rf}>Hey there {v.time} </h1>,
	 p.then(e => ({h1: e}))]
}

export function extractDomInfo(db: DomBag): state.DomInfo {
	return {};
}