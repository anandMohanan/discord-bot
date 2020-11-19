const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'bans a user',
  execute(message, args) {
    if (message.member.hasPermission('BAN_MEMBERS')) {
      const userBan = message.mentions.users.first();
      if (userBan) {
        const memberBan = message.guild.member(userBan);

        if (memberBan) {
          memberBan
            .ban({
              reason: 'ban!',
            })
            .then(() => {
              let banSuccessfull = new MessageEmbed()
                .setDescription(`Successfully banned ${userBan.tag}`)
                .setColor('#2ED8BA')
                .setTimestamp();
              message.reply(banSuccessfull);
            })
            .catch((error) => {
              console.log(error);
              let banNoPerm = new MessageEmbed()
                .setDescription(`Dont have enough permisiions`)
                .setColor('#2ED8BA')
                .setTimestamp();
              message.reply(banNoPerm);
            });
        } else {
          let banNoUser = new MessageEmbed()
            .setDescription('The user is not in the server')
            .setColor('#2ED8BA')
            .setTimestamp();
          message.reply(banNoUser);
        }
      } else {
        let banNoMention = new MessageEmbed()
          .setTitle('Mention a user to ban')
          .setColor('#2ED8BA')
          .setTimestamp();
        message.reply(banNoMention);
      }
    } else {
      let banNoUserPerm = new MessageEmbed()
        .setDescription('You dont have permissions to do that action')
        .setColor('#2ED8BA')
        .setTimestamp();
      message.reply(banNoUserPerm);
    }
  },
};
