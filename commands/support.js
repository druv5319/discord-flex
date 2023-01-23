const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { sendToFlex, fetchConversation } = require('../service/discord-flex-integration')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('Need help? Use this command to live chat with a support agent.')
		.addStringOption(option =>
			option.setName('description')
				.setDescription('What do you need help with?')
				.setRequired(true)),
	async execute(interaction) {
		const description = interaction.options.getString("description");
		// If a Flex Conversation with a user if present, let them know its in progress
		if(await fetchConversation(interaction.user.id)) {
			return interaction.reply({ephemeral: true, content: 'Support chat is already in progress!'})
		}
		// Create a new Flex Conversation and notify user
		else {
			sendAutomatedDM(interaction.user, description);
			sendToFlex(description, interaction.user.id);
			return interaction.reply({ephemeral: true, content: 'Support chat created. Check DM\'s.'}) 
		}
	},
};

async function sendAutomatedDM(user, description) {
	const automatedEmbed = new EmbedBuilder()
		.setTitle('Chat Support')
		.setColor('#001489')
		.setDescription('Your help request has been received. You\'ll be notified once your connected with an agent.')
		.addFields(
			{ name: 'Help Description', value: `*${description}*` },
		)
	await user.send({embeds: [automatedEmbed]});
}