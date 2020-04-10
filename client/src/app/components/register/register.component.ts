import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { User } from '../../models/user'
import { UserService } from '../../services/user.service'

@Component({
	selector:'register', 
	templateUrl:'./register.component.html'
})

export class RegisterComponent implements OnInit{

	public title:string
	public user: User


	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
		
		){
		this.title = "Regístrate"
		this.user = new User("","","","","","","ROLE_USER","")
	}

	ngOnInit(){
		console.log("Componente de register cargado...")
	}

	onSubmit(){
		this._userService.register(this.user).subscribe(
			response =>{
				console.log(response)
				if(response.user && response._id){
					console.log(this.user)
				}else{
					console.log(response)
				}
			}, error =>{
				console.log(<any>error)
			})
	}
}