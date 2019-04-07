import React from 'react'

export default class Wrapper extends React.Component {

	componentDidMount(){
		console.clear()

		const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
		const reactInstances = window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers || null;
  		const instance = reactInstances[Object.keys(reactInstances)[0]];
		
  		let walker 

		devTools.onCommitFiberRoot = (function (original) {

	        return function (...args) {

	        	let node = args[1]
	        	// traverse16(args[1])

	        	if(args[1].current.memoizedState){
	        		console.log(args[1].current)
	        	}

		        return original(...args);
        };
      	})(devTools.onCommitFiberRoot);

	}

	render (){
	
		return (
			<div>
			{this.props.children}
			</div>


		)
	}

}


//  Created by Grant Kang, William He, and David Sally on 9/10/17.
//  Copyright © 2018 React Sight. All rights reserved.
 
/* eslint brace-style: off, camelcase: off, max-len: off, no-prototype-builtins: off, no-restricted-syntax: off, consistent-return: off, no-inner-declarations: off */
/* eslint no-use-before-define: off, no-var: off */

var __ReactSightDebugMode = (process.env.NODE_ENV === 'debug');
let __ReactSightStore;

/** TODO - get objects to work
  *
  * Parse the props for React 16 components
  */
export const props16 = (node) => {
  try {
    const props = {};
    const keys = Object.keys(node.memoizedProps);

    keys.forEach((prop) => {
      const value = node.memoizedProps[prop];
      if (typeof value === 'function') props[prop] = parseFunction(value);
      // TODO - get these objects to work, almost always children property
      else if (typeof node.memoizedProps[prop] === 'object') {
        // console.log("PROP Object: ", node.memoizedProps[prop]);
        props[prop] = 'object*';

        // TODO - parse object
      }
      else props[prop] = node.memoizedProps[prop];
    });
    return props;
  } catch (e) {
    return {};
  }
};




/** TODO: Get Props
 *
 * Traverse through vDOM (React 16) and build up JSON data
 *
 */
export const recur16 = (node, parentArr) => {

  const newComponent = {
    name: '',
    children: [],
    state: null,
    props: null,
    id: null,
    isDOM: null,
  };

  // get name and type
  if (node.type) {
    if (node.type.name) {
      newComponent.name = node.type.name;
      newComponent.isDOM = false;
    }
    else {
      newComponent.name = node.type;
      newComponent.isDOM = true;
    }
  }

  // get state
  if (node.memoizedState) newComponent.state = node.memoizedState;

  // get props
  if (node.memoizedProps) newComponent.props = props16(node);

  // get store
  if (node.type && node.type.propTypes) {
    if (node.type.propTypes.hasOwnProperty('store')) {
      __ReactSightStore = node.stateNode.store.getState();
    }
  }

  newComponent.children = [];
  
  parentArr.push(newComponent);
  
  if (node.child != null) recur16(node.child, newComponent.children);
  
  if (node.sibling != null) recur16(node.sibling, parentArr);
};



/**
 * Traversal Method for React 16
 *
 * If the application is using React Fiber, run this method to crawl the virtual DOM.
 * First, find the React mount point, then walk through each node
 * For each node, grab the state and props if present
 * Finally, POST data to window to be recieved by content-scripts
 *
 * @param {array} components - array containing parsed virtual DOM
 *
 */
export const traverse16 = (fiberDOM) => {

  if (typeof fiberDOM === 'undefined') return;
  
  console.log('fiberDOM', fiberDOM)

  const components = [];
  
  recur16(fiberDOM.current.stateNode.current, components);
  
  const data = {
    data: components,
    store: __ReactSightStore,
  };

  data.data = data.data[0].children[0].children;

  // console.log(data.data)

  const ReactSightData = { data: components, store: __ReactSightStore };

  const clone = JSON.parse(JSON.stringify(ReactSightData));

  if (__ReactSightDebugMode) console.log('[ReactSight] retrieved data --> posting to content-scripts...: ', ReactSightData);

  if (__ReactSightDebugMode) console.log('[ReactSight] SENDING -> ', clone);

  window.postMessage(clone, '*');

};



export const parseFunction = (fn) => {
  const string = `${fn}`;

  const match = string.match(/function/);
  if (match == null) return 'fn()';

  const firstIndex = match[0] ? string.indexOf(match[0]) + match[0].length + 1 : null;
  if (firstIndex == null) return 'fn()';

  const lastIndex = string.indexOf('(');
  const fnName = string.slice(firstIndex, lastIndex);
  if (!fnName.length) return 'fn()';
  return `${fnName} ()`;
};
