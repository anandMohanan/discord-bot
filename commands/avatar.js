const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Displays the avatar',
  execute(message, args) {
    let user;
    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
    } else if (args[0]) {
      user = message.guild.members.cache.get(args[0]).user;
    } else {
      user = message.author;
    }
    let avatar = user.displayAvatarURL({ size: 4096, dynamic: true });
    let avatarEmbed = new MessageEmbed()
      .setTitle(`Showing ${user.tag} avatar`)
      .setImage(avatar)
      .setColor('#2ED8BA')
      .setTimestamp();
    if (!args.length) {
      return message.channel.send(avatarEmbed);
    }
  },
};
