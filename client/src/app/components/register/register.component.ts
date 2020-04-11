import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params, RouterModule } from '@angular/router'
import { User } from '../../models/user'
import { UserService } from '../../services/user.service'

@Component({
	selector:'register', 
	templateUrl:'./register.component.html'
})

export class RegisterComponent implements OnInit{

	public title:string
	public user: User
	public status:string


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

	onSubmit(form){
		this._userService.register(this.user).subscribe(
			response =>{
				if(response.user && response.user._id){
					//console.log(this.user)
					this.status = 'success'
					form.reset()
				}else{
					//console.log(response)
					this.status = 'error'
				}
				console.log(this.status)
			}, error =>{
				console.log(<any>error)
			})
	}
}