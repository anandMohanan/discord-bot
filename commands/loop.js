const { canModifyQueue } = require('../util/vc');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'loop',
  aliases: ['l'],
  description: 'Toggle music loop',
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue)
      return message
        .reply('There is nothing playing.')
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    if (!canModifyQueue(message.member)) return;

    // toggle from false to true and reverse
    queue.loop = !queue.loop;
    let loopEmbed = new MessageEmbed()
      .setTitle(`Loop is now ${queue.loop ? '**on**' : '**off**'}`)
      .setColor('#2ED8BA')
      .setTimestamp();
    return queue.textChannel.send(loopEmbed).catch(console.error);
  },
};
