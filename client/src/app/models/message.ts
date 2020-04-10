export class Message{
	constructor(
	public _id:string,
	public text:string,
	public viewed:string,
	public created_at:string,
	public emmitter:string,
	public receiver:string){}
}