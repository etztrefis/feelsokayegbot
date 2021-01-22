module.exports.help = {

	name: 'command name',
	active: true / false, this parameter may be missing since active is true by default in database
	permission: true / false, this parameter may be missing since permission is false by default in database,
		if true command will execute only if sender is fob.Config.owner 
	cooldown: 5000 by default,
	cooldown_mode: 'UserCommand' by default, User, UserCommandChannel or Channel,
	aliases: command aliases syntax --> ['',''], if command has no aliases then parametr should be [],
	description: 'command description',
	run: your code here, syntax --> async () => {},

};