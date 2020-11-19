const { canModifyQueue } = require('../util/vc');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'resume',
  aliases: ['r'],
  description: 'Resume currently playing music',
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      let rsNo = new MessageEmbed()
        .setTitle('There is nothing playing.')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message
        .reply(rsNo)
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;

    if (!queue.playing) {
      queue.playing = true;
      queue.connection.dispatcher.resume();

      let rsDone = new MessageEmbed()
        .setTitle(`${message.author.tag}  ▶  resumed the music!`)
        .setColor('#2ED8BA')
        .setTimestamp();
      return queue.textChannel.send(rsDone).catch(console.error);
    }
    let rsPause = new MessageEmbed()
      .setTitle('The queue is not paused.')
      .setColor('#2ED8BA')
      .setTimestamp();
    return message.reply(rsPause).catch(console.error);
  },
};
