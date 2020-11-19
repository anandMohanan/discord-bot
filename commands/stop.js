const { canModifyQueue } = require('../util/vc');
const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'stop',
  description: 'Stops the music',
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) {
      let stopNo = new MessageEmbed()
        .setTitle('There is nothing playing.')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.channel
        .send(stopNo)
        .then((msg) => {
          msg.delete({ timeout: 15000 });
        })
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;

    queue.songs = [];
    queue.connection.dispatcher.end();

    let stopDone = new MessageEmbed()
      .setTitle(`${message.author.tag} ⏹ stopped the music!`)
      .setColor('#2ED8BA')
      .setTimestamp();
    queue.textChannel.send(stopDone).catch(console.error);
  },
};
