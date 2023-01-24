require('dotenv').config();

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

module.exports = {
    sendToFlex: async function(message, userId) {
        // Fetch ongoing Flex Conversation
        let currentConversationSid = await module.exports.fetchConversation(userId);
        // If Conversation is not present, create one
        if(!currentConversationSid) {
            const newConversation = await createConversation(userId);
            await createParticipant(newConversation.sid, userId);
            await createScopedWebhooks(newConversation.sid, userId);
            currentConversationSid = newConversation.sid;
        }
        // Pass message on to ongoing Flex Conversation
        await sendMessage(currentConversationSid, userId, message);
    },
    fetchConversation: async function(userId) {
        const allConversations = await client.conversations.participantConversations.list({identity: `Discord_user_${userId}`});
        let conversation = allConversations.find(conversation => conversation.conversationState !== 'closed');
        return conversation !== undefined ? conversation.conversationSid : undefined;
    }
}

async function createConversation(userId) {
    return client.conversations.conversations.create({
        friendlyName: `Discord_conversation_${userId}`
    });
}
async function createParticipant(conversationSid, userId) {
    const identity = `Discord_user_${userId}`;
    return client.conversations.conversations(conversationSid)
        .participants
        .create({identity: identity});
}
async function createScopedWebhooks(conversationSid, userId) {
    // Triggers Studio flow to route the new Conversation to Flex
    await client.conversations.conversations(conversationSid).webhooks.create({
            'configuration.filters': 'onMessageAdded',
            target: 'studio',
            'configuration.flowSid': process.env.STUDIO_FLOW_SID
        });
    // Triggers /newMessage route on this server whenever a message is added to the Conversation
    await client.conversations.conversations(conversationSid).webhooks.create({
            target: 'webhook',
            'configuration.filters': ['onMessageAdded'],
            'configuration.method': 'POST',
            'configuration.url': `${process.env.SERVER_URL}/newMessage?user_id=${userId}`,
        })
}
async function sendMessage(conversationSid, userId, message) {
    const identity = `Discord_user_${userId}`;
    return client.conversations.conversations(conversationSid).messages.create({
            author: identity,
            body: message,
            xTwilioWebhookEnabled: true
        });
}