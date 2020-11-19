const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'kick a user',
  execute(message, args) {
    if (
      message.member.hasPermission('KICK_MEMBERS') ||
      message.member.hasPermission('BAN_MEMBERS')
    ) {
      const userKick = message.mentions.users.first();
      if (userKick) {
        const memberKick = message.guild.member(userKick);
        if (memberKick) {
          memberKick
            .kick('reason')
            .then(() => {
              let kickSuccessful = new MessageEmbed()
                .setTitle(`Successfully kicked ${memberKick}`)
                .setColor('#2ED8BA')
                .setTimestamp();
              message.reply(kickSuccessful);
            })
            .catch((error) => {
              console.log(error);
              let kickNoPerm = new MessageEmbed()
                .setTitle(`Dont have enough permisions`)
                .setColor('#2ED8BA')
                .setTimestamp();
              message.reply(kickNoPerm);
            });
        } else {
          let kickNoUser = new MessageEmbed()
            .setTitle('The user is not in the server')
            .setColor('#2ED8BA')
            .setTimestamp();
          message.reply(kickNoUser);
        }
      } else {
        let kickNoMention = new MessageEmbed()
          .setTitle('Mention a member to kick them')
          .setColor('#2ED8BA')
          .setTimestamp();
        message.reply(kickNoMention);
      }
    } else {
      let kickNoUserPerm = new MessageEmbed()
        .setTitle('You dont have permissions to do that action')
        .setColor('#2ED8BA')
        .setTimestamp();
      message.reply(kickNoUserPerm);
    }
  },
};
