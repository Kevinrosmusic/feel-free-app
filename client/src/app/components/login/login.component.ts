import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { User } from '../../models/user'
import { UserService } from '../../services/user.service'

@Component({
	selector:'login', 
	templateUrl:'./login.component.html',
	providers: [UserService]
})

export class LoginComponent implements OnInit{

	public title:string
	public user: User
	public status:string
	public identity
	public token

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
		){
		this.title = "Identificate"
		this.user = new User("","","","","","","ROLE_USER","")	
	}

	ngOnInit(){
		console.log("Componente de login cargado...")
	}

	onSubmit(){
		//LOGEAR AL USUARIO Y CONSEGUIR SUS DATOS
		this._userService.singup(this.user).subscribe(

			response  => {
				this.identity = response.user
				if(!this.identity || !this.identity.id){
					this.status = 'error'
				}else {
					this.status = 'success'
				}
				this.status="success"
				// PERSISTIR DATOS DEL USUARIO

				localStorage.setItem('identity', JSON.stringify(this.identity))

				//CONSEGUIR TOKEN
				this.getToken()
			},
			error =>{
				var errorMessage = <any>error
				console.log(errorMessage)

				if(errorMessage != null){
				this.status = 'error'
				}
			}
		)
	}

	getToken(){
		//LOGEAR AL USUARIO Y CONSEGUIR SUS DATOS
		console.log(this.user)
		this._userService.singup(this.user, 'true').subscribe(

			response  => {

				this.token = response.token

				if(this.token.lengh <= 0){
					this.status = 'error'
				}else {
					this.status = 'success'
				}
				console.log(response)
				this.status="success"
				// PERSISTIR TOKEN DEL USUARIO


				localStorage.setItem('token', this.token)

				//CONSEGUIR LOS CONTADORES O ESTADÍSTICAS DEL USUARIO
			},
			error =>{

				var errorMessage = <any>error
				console.log(errorMessage)

				if(errorMessage != null){
				this.status = 'error'
				}
			}
		)
	}
}