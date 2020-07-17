import React from './../freact'



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

		if(!this.mounted){
			this.mounted = true
			if(!this.props.in)
				return;
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
			return null;
		}

		if(defaultClasses)
		cssClass=`${classNames} ${cssClass}`;

		cssClass = `${children.props.class} ${cssClass}`;

		var cl = React.cloneElement(children,{class:cssClass});
		return cl;
	}
}

export default CSSTransition
