const { Events } = require('discord.js');
const { sendToFlex, fetchConversation } = require('../service/discord-flex-integration')

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (!message.author.bot && message.channel.type == 1 ) {
            if(await fetchConversation(message.author.id)) sendToFlex(message.content, message.author.id)
            else {
                message.reply('*Support chat not in progress. To request for support, use /support command on our server.*')
            }
            
        }
	},
};