const { canModifyQueue } = require('../util/vc');
const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'remove',
  aliases: ['rm'],
  description: 'Remove song from the queue',
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      let noQueue = new MessageEmbed()
        .setTitle('There is no queue.')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.channel
        .send(noQueue)
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;

    if (!args.length) {
      let rmUsage = new MessageEmbed()
        .setTitle(`Usage: ${message.client.prefix}remove <Queue Number>`)
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.channel.send(rmUsage);
    }
    if (isNaN(args[0])) {
      let rmUsagea = new MessageEmbed()
        .setTitle(`Usage: ${message.client.prefix}remove <Queue Number>`)
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.channel.send(rmUsagea);
    }
    const song = queue.songs.splice(args[0] - 1, 1);
    let rmDone = new MessageEmbed()
      .setTitle(
        `${message.author.tag} ❌ removed **${song[0].title}** from the queue.`
      )
      .setColor('#2ED8BA')
      .setTimestamp();
    queue.textChannel.send(rmDone);
  },
};
