const { canModifyQueue } = require('../util/vc');
const { MessageEmbed } = require('discord.js');
module.exports = {
  name: 'shuffle',
  description: 'Shuffle queue',
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      let shuffleNo = new MessageEmbed()
        .setTitle('There is no queue.')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.channel
        .send(shuffleNo)
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;

    let songs = queue.songs;
    for (let i = songs.length - 1; i > 1; i--) {
      let j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    queue.songs = songs;
    message.client.queue.set(message.guild.id, queue);

    let shuffleDone = new MessageEmbed()
      .setTitle(`${message.author} 🔀 shuffled the queue`)
      .setColor('#2ED8BA')
      .setTimestamp();
    queue.textChannel.send(shuffleDone).catch(console.error);
  },
};
