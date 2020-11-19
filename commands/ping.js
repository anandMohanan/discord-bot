const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'How fast the bot is responding',
  execute(message) {
    const timeTaken = Date.now() - message.createdTimestamp;
    let pingEmbed = new MessageEmbed()
      .setTitle(`Pong! This message had a latency of ${timeTaken}ms.`)
      .setColor('#2ED8BA')
      .setTimestamp();
    return message.reply(pingEmbed);
  },
};
