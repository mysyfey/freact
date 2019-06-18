import React from './../freact/freact'



const enter = '-enter';
const enterActive = '-enter-active';
const enterDone = '-enter-done';
const exit = '-exit';
const exitActive = '-exit-active';
const exitDone = '-exit-done';

class CSSTransition extends React.Component {


	constructor(props){
		super(props);
		this.mounted = false;
		this.state = { cssClass: ""};
		//this.inProps = this.props.in;
	}

    setAnimation(phase){
    	var newClass;
    	switch(phase){

    		case "active":
    			newClass = `${this.props.classNames}${this.props.in ? enter : exit} ${this.props.classNames}${this.props.in ? enterActive : exitActive}`
    			break;

    		case "done":
    			newClass = `${this.props.classNames}${this.props.in ? enterDone : exitDone}`
    			break;
    	}

    	this.setState({ cssClass: newClass})
    }

    startTransition(){
			this.timer = setTimeout(() => {

				clearTimeout(this.timer);			
				this.setAnimation("active");

				this.timer = setTimeout(() => {
					clearTimeout(this.timer);

					this.setAnimation("done");

					this.transitionStarted = false;
					//console.log("setanimation done",this.transitionStarted)
				},this.props.timeout);

			}, 5);
		
    }

	componentDidMount() {

		console.log("CssTransition componentDidMount",this.state.cssClass);
		if(!this.mounted){
			this.mounted = true
			if(!this.props.in){// && this.props.unmountOnExit){
				return;
			}
		}

		if(!this.transitionStarted){

			this.transitionStarted = true;

			this.setAnimation("start");
			this.startTransition()
		}

    }

    shouldComponentUpdate(props, state){
    	return state.cssClass != this.state.cssClass || props.in != this.props.in;
    }

    componentWillMount() {
    	console.log("CssTransition componentWillMount",this.state.cssClass);
    }

    componentWillUnmount() {
    	console.log("CssTransition componentDidUnmount",this.state.cssClass);
    }

    render(){
    	var {cssClass}= this.state ;
    	var {children,defaultClasses,classNames} = this.props

		//console.log("render")
    	if(!this.mounted){
    		if(this.props.unmountOnExit &&!this.props.in){
    			//console.log("unmountOnStart")
    			return null;
    		}
    	}
    	else if(!this.transitionStarted){
    		this.transitionStarted = true;
    		cssClass=`${classNames}${this.props.in ? enter : exit}`;
    		
    		this.startTransition();
    	} else if(cssClass && cssClass.endsWith(exitDone) && this.props.unmountOnExit){
    		//console.log("unmountOnExit")
    		return null;
    	}

    	if(defaultClasses)
    		cssClass=`${classNames} ${cssClass}`;

		cssClass = `${children.props.class} ${cssClass}`;

		//var newProps = {className:cssClass};
		//var clone = React.cloneElement(children,{className:cssClass});
		//console.log("clone",clone)
//<children.type {...{...children.props,...newProps}}>{children.children}</children.type>
		var cl = React.cloneElement(children,{class:cssClass});
		console.log("CssTransition render",cl);
		return cl;
		/*React.Children.map(this.props.children,child=>{
			React.cloneElement(child,newProps)
		})*/
    }
}

export default CSSTransition