const { canModifyQueue } = require('../util/vc');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'skip',
  aliases: ['s'],
  description: 'Skip the currently playing song',
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      let skipNo = new MessageEmbed()
        .setTitle('There is nothing playing that I could skip for you.')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message
        .reply(skipNo)
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;

    queue.playing = true;
    queue.connection.dispatcher.end();
    let skipDone = new MessageEmbed()
      .setTitle(`${message.author.tag}  ⏭  skipped the song`)
      .setColor('#2ED8BA')
      .setTimestamp();
    queue.textChannel.send(skipDone).catch(console.error);
  },
};
