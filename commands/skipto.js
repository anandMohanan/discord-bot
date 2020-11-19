const { canModifyQueue } = require('../util/vc');
const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'skipto',
  aliases: ['st'],
  description: 'Skip to the selected queue number',
  execute(message, args) {
    if (!args.length || isNaN(args[0])) {
      let skipToUsage = new MessageEmbed()
        .setTitle(
          `Usage: ${message.client.prefix}${module.exports.name} <Queue Number>`
        )
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.channel.send(skipToUsage).catch(console.error);
    }
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      let skipToNoQueue = new MessageEmbed()
        .setTitle('There is no queue.')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.channel
        .send(skipToNoQueue)
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;
    if (args[0] > queue.songs.length) {
      let skipToNoMulti = new MessageEmbed()
        .setTitle(`The queue is only ${queue.songs.length} songs long!`)
        .setColor('#2ED8BA')
        .setTimestamp();
      return message
        .reply(skipToNoMulti)
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    }
    queue.playing = true;

    if (queue.loop) {
      for (let i = 0; i < args[0] - 2; i++) {
        queue.songs.push(queue.songs.shift());
      }
    } else {
      queue.songs = queue.songs.slice(args[0] - 2);
    }

    queue.connection.dispatcher.end();
    let skipToDone = new MessageEmbed()
      .setTitle(`${message.author.tag} ⏭ skipped ${args[0] - 1} songs`)
      .setColor('#2ED8BA')
      .setTimestamp();
    queue.textChannel.send(skipToDone).catch(console.error);
  },
};
