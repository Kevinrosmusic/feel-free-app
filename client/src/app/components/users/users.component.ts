import { Component, OnInit } from  '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { User } from '../../models/user'
import { UserService } from '../../services/user.service'
import { GLOBAL } from '../../services/global'

@Component({
	selector:'users',
	templateUrl: './users.component.html',
	providers: [UserService]
})

export class UsersComponent implements OnInit {

	public title:string
	public identity
	public token
	public page
	public next_page
	public prev_page
	public status
	public total
	public users
	public url:string
	public pages
	public follows
	
	constructor(
		 private _route: ActivatedRoute,
		 private _router: Router,
		 private _userService: UserService
		) {
		this.title = 'Gente'
		this.url = GLOBAL.url
		this.identity = this._userService.getIdentity()
		this.token = this._userService.getToken()
	}

	ngOnInit(){
		console.log("Users component ha sido cargado")
		this.actualPage()
	}

	actualPage(){
		this._route.params.subscribe(params =>{
		let page = +params['page']
		this.page = page

		if(!page || page == NaN || page == undefined || page == null){
			this.page = 1
			this._router.navigate(['/gente', this.page]);
		}else{

			this.next_page = page +1 
			this.prev_page = page -1

			if(this.prev_page <= 0){
				this.prev_page = 1
				}
			}
			this.getUsers(page)
		})
	}


//////////////////////////////////////// USERS LIST ///////////////////////////////////////////////////////////


		getUsers(page) {
			this._userService.getUsers(page).subscribe(

				response =>{
					if(!response.users){
						this.status = 'error'

					}else{
						this.total = response.total
						this.users = response.users
						this.pages = response.pages
						this.follows = response.users_following

						if(page > response.pages){
							this._router.navigate(['/gente',1])
						}
					}
				},

				error => {
					 var error_message = <any> error
					 console.log(error_message)

					 if(error_message != null){
					 	this.status = 'error'
					 }
					}

				)
			}

			public followUserOver
			mouseEnter(user_id){
				this.followUserOver = user_id
			}

			mouseLeave(user_id){
				this.followUserOver = 0
			}
		}
