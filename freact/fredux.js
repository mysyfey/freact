import {createElement, Component } from 'react';
import PropTypes from 'prop-types';


export const connect = (mapStateToProps, mapDispatchToProps) => Compo => {

		const childCompo = compo;

		class ConnectHOC extends Component {

			static contextTypes = {
	    	store: PropTypes.shape({subscribe: PropTypes.func.isRequired,dispatch: PropTypes.func.isRequired,getState: PropTypes.func.isRequired})
	  	};

	  	constructor(props,context){
	  		super(props,context)

	  		this.shouldUpdate = false;
	  		this.currentProps = {};  		
	  		this.stateProps = {};
	  		//this.justProps = props;
	  		this.state = {dummy:0};

	  		this.mount = false;

	  		this.store = this.context.store;

	  		
	  		Object.assign(this.currentProps,this.props);

	  		
	  		if(mapDispatchToProps){
	  			var actions = mapDispatchToProps(store.dispatch)
	  			Object.assign(this.currentProps,actions);
	  		}

				if(mapStateToProps){

		  		this.stateProps = mapStateToProps(store.getState());

		  		Object.assign(this.currentProps,this.stateProps);

		  		this.stateChanged = function() {


		  			//if(this.mount){
		  			this.shouldUpdate = false;

		  			var newProps = mapStateToProps(store.getState());

		  			console.log("state",newProps);
		  			
		  			for (var i in newProps) {
		  				if(newProps[i] !== this.stateProps[i]){
		  					this.shouldUpdate = true;
		  					break;
		  				}
		  			}


		  			if(this.shouldUpdate){
		  				this.stateProps = newProps;
		  				Object.assign(this.currentProps,this.stateProps);
		  				console.log("update current",this.currentProps)
		  				this.setState({dummy:this.state.dummy + 1});
		  			}
		  			//}
		  				
		  		}

	  		}

	  	}

	  	componentRecievedProps(newProps){
	  		//
	  	}
			componentDidMount() {
				console.log("componentDidMount")
				this.unsubscribe = this.store.subscribe(this.stateChanged.bind(this));
		  }

		  componentWillUnmount() {
		  	console.log("componentWillUnmount")
		  	this.unsubscribe();
		  }

	  	shouldComponentUpdate(props){
	  		
	  		for (var i in props) {
		  				if(props[i] !== this.justProps[i]){
		  					this.shouldUpdate = true;
		  					this.justProps = props;
		  					break;
		  				}
		  	}

		  	if(this.shouldUpdate)
		  		Object.assign(this.currentProps,this.justProps);
		  			
				//console.log("connect s",props,this.shouldUpdate)
	  		return this.shouldUpdate;
	  	}

			render(){
				let result = this.currentProps;
				return (<Compo {...result}/>)
				//createElement(childCompo,this.currentProps); 				
			}
				
		} 

		return ConnectHOC;
};

var singleton;

export function createStore(reducer,defaultState,middlewares = []){

	var state = defaultState;
	var reducer = reducer;
	var listeners = new Array();
	var middlewares = middlewares;
	middlewares.push(callReducer);

	function callReducer(action){
			state= reducer(state, action);		
		
			for (var i = 0; i < listeners.length; i++) {
				listeners[i]();
			}
	}

	var dispatch = function(...rest) {
		var mIndex = 0;
		function mid(...rest){
			middlewares[mIndex++](mIndex < middlewares.length ? mid : null,...rest);
		}
		mid(...rest)
	};

	var getState = function() {
		return state;
	};
	//Schitt’s Creek mob+psycho+100
	var subscribe = function(listener) {
		listeners.push(listener);
		return ()=>listeners.remove(listener)
	};
	
	dispatch({type:"@@INIT"});

	return singleton = {
		dispatch,
		getState,
		subscribe
	};
}

export function bindActionCreators(actions, dispatch){
	var binded = {};
	for (var i in actions) {
	 	binded[i] = function (...args) {
	 		
	 		var aug = Array.prototype.slice.call(args);
	 		console.log("bindActionCreators",aug);
	 		actions[i].apply(args[0])(dispatch, singleton.getState);
	 		
	 	}
	}
	return binded;
}