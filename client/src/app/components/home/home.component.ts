import { Component, OnInit } from '@angular/core'


@Component({
	selector: 'home',
	templateUrl: './home.component.html'

})

export class HomeComponent implements OnInit {

	public title:string
	
	constructor() {
		this.title='Bienvenido a la Feel Free App'
	}

	ngOnInit(){
		console.log('home.component.ts CARGADO!')
	}
}