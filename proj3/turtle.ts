interface OnclickHandler{
	(x:number, y:number): void ;
}

interface UpdateHandler{
	(): void;
}

class Sprite 
{
	x: number;
	y: number;
	speed: number;
	dest_x: number;
	dest_y: number;
	image: HTMLImageElement;
	onclick:OnclickHandler;
	update:UpdateHandler;

	
	constructor(x:number, y:number, image_url:string, update_method:UpdateHandler, onclick_method:OnclickHandler) {
		this.x = x;
		this.y = y;
        this.speed = 4;
		this.image = new Image();
		this.image.src = image_url;
		this.update = update_method;
		this.onclick = onclick_method;
		this.dest_x = this.x;
		this.dest_y = this.y;
	}

	set_destination(x:number, y:number){
		this.dest_x = x;
		this.dest_y = y;
	}	

	ignore_click(x:number, y:number){
	}	

	move(dx:number, dy:number) {
		this.dest_x = this.x + dx;
		this.dest_y = this.y + dy;
	}

	go_toward_destination(){
		if(this.dest_x === undefined)
			return;

		if(this.x < this.dest_x)
			this.x += Math.min(this.dest_x - this.x, this.speed);
		else if(this.x > this.dest_x)
			this.x -= Math.min(this.x - this.dest_x, this.speed);
		if(this.y < this.dest_y)
			this.y += Math.min(this.dest_y - this.y, this.speed);
		else if(this.y > this.dest_y)
			this.y -= Math.min(this.y - this.dest_y, this.speed);
	}	

	sit_still(){
	}
}

class Model {
	sprites:Sprite[];
	turtle:Sprite;

	constructor() {
		this.sprites = [];
		this.sprites.push(new Sprite(200, 100, "lettuce.png", Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
		this.turtle = new Sprite(50, 50, "turtle.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
		this.sprites.push(this.turtle);
	}

	update() {
		for (const sprite of this.sprites) {
			for(let i = 0; i < this.sprites.length; i++) {
				this.sprites[i].update();
			}
		}
	}

	onclick(x:number, y:number) {
		for (const sprite of this.sprites) {
			for(let i = 0; i < this.sprites.length; i++) {
				this.sprites[i].onclick(x, y);
			}
		}
	}

	move(dx:number, dy:number) {
		this.turtle.move(dx, dy);
	}
}

class View
{
	turtle:HTMLImageElement;
	model:Model;
	canvas:HTMLCanvasElement;
	
	constructor(model:Model) {
		this.model = model;
		this.canvas = document.getElementById("myCanvas") as unknown as HTMLCanvasElement;
		this.turtle = new Image();
		this.turtle.src = "turtle.png";
	}

	update() {
		let ctx = this.canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
		ctx.clearRect(0, 0, 1000, 500);
		for (const sprite of this.model.sprites) {
			ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
		}
	}
}

class Controller
{
	key_right: boolean;
	key_left: boolean;
	key_up: boolean;
	key_down: boolean;
	model:Model;
	view:View;

	constructor(model:Model, view:View) {
		this.model = model;
		this.view = view;
		this.key_right = false;
		this.key_left = false;
		this.key_up = false;
		this.key_down = false;
		let self = this;
		view.canvas.addEventListener("click", function(event) { self.onClick(event); });
		document.addEventListener('keydown', function(event) { self.keyDown(event); }, false);
		document.addEventListener('keyup', function(event) { self.keyUp(event); }, false);
	}

	onClick(event:MouseEvent) {
		const x = event.pageX - this.view.canvas.offsetLeft;
		const y = event.pageY - this.view.canvas.offsetTop;
		this.model.onclick(x, y);
	}

	keyDown(event:KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = true;
		else if(event.keyCode == 37) this.key_left = true;
		else if(event.keyCode == 38) this.key_up = true;
		else if(event.keyCode == 40) this.key_down = true;
	}

	keyUp(event:KeyboardEvent) {
		if(event.keyCode == 39) this.key_right = false;
		else if(event.keyCode == 37) this.key_left = false;
		else if(event.keyCode == 38) this.key_up = false;
		else if(event.keyCode == 40) this.key_down = false;
	}

	update() {
		let dx = 0;
		let dy = 0;
        let speed = this.model.turtle.speed;
		if(this.key_right) dx += speed;
		if(this.key_left) dx -= speed;
		if(this.key_up) dy -= speed;
		if(this.key_down) dy += speed;
		if(dx != 0 || dy != 0)
			this.model.move(dx, dy);
	}
}

class Game {
	model:Model;
	view:View;
	controller:Controller;
	constructor() {
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}

let game = new Game();
let timer = setInterval(() => { game.onTimer(); }, 40);
