
class Component {

    constructor(props){
        this.props = props;
    }

    // state

    setState(state){
        if(!this.state)
            this.state = {};
        //this.state = {...this.state, ...state};
        this.stateChanged(state);
    }

    setStateChanged(subscriber){
        this.stateChanged = subscriber;
    }

    // lifecycle


    componentWillMount(){
        //console.log("Component componentWillMount")
    }

    componentDidMount(){
        //console.log("Component componentDidMount")
    }

    componentWillUnmount(){
        console.log("Component componentWillUnmount")
    }

    shouldComponentUpdate(){
        console.log("shouldComponentUpdate ",this.constructor.name)
        return true;
    }

    componentWillUpdate(){
        //console.log("Component componentWillUpdate")
    }

    componentDidUpdate(){
        //console.log("Component componentDidUpdate")
    }
}

class Element{

    constructor(el,props,...rest) {

        var childrenArray = [...rest];
        var logicalChildren = childrenArray.length == 1 ? childrenArray[0] : childrenArray;

        if(typeof(el) == 'string'){
            this.type = el;
            this.children = childrenArray;
            this.props = props;
        } else {  

            function couldBeClass(obj, strict) {
                if (typeof obj != "function") return false;

                var str = obj.toString();
                
                // async function or arrow function
                if (obj.prototype === undefined) return false;
                // generator function or malformed definition
                if (obj.prototype.constructor !== obj) return false;
                 // ES6 class
                if (str.slice(0, 5) == "class") return true;
                // has own prototype properties
                if (Object.getOwnPropertyNames(obj.prototype).length >= 2) return true;
                // anonymous function
                if (/^function\s+\(|^function\s+anonymous\(/.test(str)) return false;
                // ES5 class without `this` in the body and the name's first character 
                // upper-cased.
                if (strict && /^function\s+[A-Z]/.test(str)) return true;
                 // has `this` in the body
                if (/\b\(this\b|\bthis[\.\[]\b/.test(str)) {
                    // not strict or ES5 class generated by babel
                    if (!strict || /classCallCheck\(this/.test(str)) return true;

                    return /^function\sdefault_\d+\s*\(/.test(str);
                }

                return false;
            }
        
            if(couldBeClass(el, false)) {
                console.log("empty shell component ",el.name)
                this.component = true;
                this.type = el.name;
                this.componentClass = el;
                this.props = ({...props,"children":logicalChildren});

                /*this.component = new el({...props,"children":logicalChildren});
                this.type = this.component.constructor.name;
                this.component.setStateChanged(this.updateDom.bind(this));*/
            }else {
                this.type = el.name;
                this.children = [el({...props,"children":logicalChildren})];
                this.props = props;
            }
        }
    }

    render(parent){

        var node = this._render(parent);
        parent.appendChild(node);

        if(this.component)
            this.component.componentDidMount();
    }

    _render(parent){

        // get the virtual DOM node on the real DOM tree for the first time, so will call the Mount Lifecycle methods
        
        var node;
        
        if(this.component){

            console.log("render component ",this.type)

            this.component = new this.componentClass(this.props);
            //this.type = this.component.constructor.name;
            this.props = null;
            this.children = [this.component.render()];          
            this.component.setStateChanged(this.updateDom.bind(this));
            this.node = parent
            this.component.componentWillMount();

            var child = this.children[0];

            if(child instanceof Element){
                return child._render();
            } else if (typeof(child) == "string"){
                return document.createTextNode(child);
            } else {
                console.log("what the f**k is this ",child);
                return null;
            }
        }
        else {
            node = document.createElement(this.type)       
       

        for (var i = 0; i < this.children.length; i++) {

            var child = this.children[i];



            if(!child) {
                this.children.splice(i,1);
                i--;
                break;
            } 

            if(child instanceof Array){
                child = child[0];
            }

            if(child instanceof Element){
                child.render(node);
            } else if (typeof(child) == "string"){
                node.appendChild(document.createTextNode(child));
            } else {
                console.log("what the f**k is this ",child);
            }
        }

        for (var i in this.props) {
            if(i == "onClick"){
                node.onclick = this.props[i];
            }else if(i == "ref"){
                this.props[i].current = this.component ? this.children[0].node : node;
            }else
                node.setAttribute(i,this.props[i]);
        }

        this.node = node; 
        return node;
        }
    
    }

    updateDom(state){
        if(this.component.shouldComponentUpdate(this.component.props,state)){
            this.component.state = {...this.component.state,...state}
            var child = this.component.render();
            this.children[0]._updateDom(child, this,0)       
        }
    }

    _updateDom(updated,parentEl,index){

        //three diff rules: type, attr, children

            // check type
            if(this.type != updated.type){

                //it's a completely different type of element, replace node now!
                parentEl.replaceNode(updated,index);

            }else{

                var newChildren = updated.children;

                //shouldComponentUpdate or componentWillUpdate

                if(this.component){

                    if(!this.component.shouldComponentUpdate(updated.props,this.component.state))
                        return;

                    this.component.props = updated.props;
                    newChildren = [this.component.render()];

                    this.component.componentWillUpdate();
                }

                //check attr

                if(!updated.component){
                    for (var i in updated.props) {
                        if(i == "onClick")
                            break;
                        else if(this.props[i]){
                            if(this.props[i] != updated.props[i]){
                                this.node.setAttribute(i,updated.props[i]);
                            }
                        } else {
                            this.node.removeAttribute(this.props[i]);
                            this.node.setAttribute(i,updated.props[i]);
                        }
                    }
                }

                //check children

                for (var i = 0; i < newChildren.length; i++) {

                     var child = this.children[i], newChild=newChildren[i];                     

                     if(newChild instanceof Element){
                        
                        if(!child){  

                            // the updated has more children than the old, append new node
                            this.node.appendChild(newChild._render(this.node))
                            this.children[i] = newChild;

                        } else if(typeof(child) == "string"){

                            // old child is string while the updated isn't,  just replace
                            this.replaceNode(newChild,i)
                        } else{
                            child._updateDom(newChild, this, i);
                        }

                     } else if (typeof(newChild) == "string" && newChild != child){

                        // updated child is a string, this is easy, just create or replace a text node
                        
                        if(child.component)
                            child.component.componentWillUnmount();

                        this.children[i] = newChild;
                        if(!child){
                            this.node.appendChild(document.createTextNode(newChild));
                        } else if(newChild != child){
                            this.node.replaceChild(document.createTextNode(newChild),this.node.childNodes[i]);
                        }
                     }
                }   

                //componentDidUpdate

                if(this.component)
                    this.component.componentDidUpdate();             
            }
    }

    replaceNode(newEl,index){
        var newNode = newEl._render(this.node)
        
        //if the node that's going to be replaced is a Component, we should call componentWillUnmount first;
        if(this.children[index].component)
            this.children[index].component.componentWillUnmount();

        this.children[index] = newEl;
        this.node.replaceChild(newNode,this.node.childNodes[index])

        if(newEl.component)
            newEl.component.componentDidMount();
    }
}

function createElement(el, props, ...rest){

    return new Element(el,props,...rest);
}

function cloneElement(element, props, children){
    return createElement(element.type, {...{...element.props, ...props}},children ? children : element.children)
    /*return (<element.type  {...{...element.props, ...props}} > 
        {
            children ? children : element.children
        }
    </element.type>);*/
}

function renderDOM(element, root){
    console.log("reactDOM",element);
    element.render(root);
}

function createRef(){
    return {current:null};
}

export default {createElement,
                createRef,
                cloneElement,
                renderDOM,
                Component}

