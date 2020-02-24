// 모든 이벤트의 기록자
class EventRecorder {
	constructor() {
		this.data = {};
		this.handle = EventRecorder.defaultHandle.bind(this);
	}
	type(type) {
		if (!this.data[type]) {
			this.data[type] = new EventRecorderTypeData(this, type);
			document.addEventListener(type, this.handle);
		}
		return this.data[type];
	}
	static defaultHandle(e) {
		let { type, target, path } = e;

		target.classList.forEach(className=>{
			let o = this.type(type).name(className);
			let handle = o.handle;
			if(typeof handle==='function') {
				if(Array.from(document.querySelectorAll(o.jsrange)).some(e=>path.includes(e))) {
					handle.call(this, e);
				}
			}
		});
		// type(type)
		// console.log(type, target);
	}
}
class EventRecorderTypeData {
	constructor(eventRecorder,type) {
		this.type = type;
		this.eventRecorder = eventRecorder;
		this.data = {};
	}
	name(name) {
		if (!this.data[name]) {
			this.data[name] = {};
		}
		return this.data[name];
	}

	add(className, code, jsrange='*') {
		let o = this.name(className);
		if(typeof code==='string') {
			if(o.code !== code || o.jsrange !== jsrange) {
				let handle = eval(`(function (e){${code};})`);
				if(typeof handle==='function') {
					o.handle = handle;
					o.code = code;
					o.jsrange = jsrange;
				}
			}
		}else{
			o.code = '';
			o.handle = function (){};
			o.jsrange = jsrange;
		}
	}

	remove(className) {
		delete this.data[className];
	}
}


const ui = {
	controls: $('<div>').appendTo('body').attr({id:'controls'}),
	targets: $('<div class="box"><div class="item1"></div><div class="item2"><div class="item3"></div></div><div class="item3">111</div></div>').attr({id:'targets'}).appendTo('body'),
};

ui.elements = {
	eventType: $('<input>').attr({id:'eventType'}).appendTo(ui.controls).before('eventType:').val('click'),
	jsrange: $('<input>').attr({id:'jsrange'}).appendTo(ui.controls).before('jsrange:').val('*'),
	className: $('<input>').attr({id:'className'}).appendTo(ui.controls).before('className:').val('item3'),
	code: $('<textarea>').attr({id:'code'}).appendTo(ui.controls).before('code:').val('console.log(new Date(),event.target)'),
	addButton: $('<input>').attr({type:'button'}).appendTo(ui.controls).before('add:').val('add'),
	removeButton: $('<input>').attr({type:'button'}).appendTo(ui.controls).before('remove:').val('remove'),
};


const eventRecorder = new EventRecorder();
ui.elements.addButton.on('click', function(e){
	let o = eventRecorder.type(ui.elements.eventType.val())
	o.add(ui.elements.className.val(), ui.elements.code.val(), ui.elements.jsrange.val());
});
ui.elements.removeButton.on('click', function(e){
	let o = eventRecorder.type(ui.elements.eventType.val())
	o.remove(ui.elements.className.val(), ui.elements.code.val(), ui.elements.jsrange.val());
});