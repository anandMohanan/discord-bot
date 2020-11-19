const { MessageEmbed } = require('discord.js');
const YouTubeAPI = require('simple-youtube-api');
let YOUTUBE_API_KEY;
try {
  const config = require('../config.json');
  YOUTUBE_API_KEY = config.YOUTUBE_API_KEY;
} catch (error) {
  YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
}
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

module.exports = {
  name: 'search',
  description: 'Search and select videos to play',
  async execute(message, args) {
    if (!args.length) {
      let searchUsage = new MessageEmbed()
        .setTitle(
          `Usage: ${message.client.prefix}${module.exports.name} <Video Name>`
        )
        .setColor('#2ED8BA')
        .setTimestamp();

      return message.channel.send(searchUsage).catch(console.error);
    }
    if (message.channel.activeCollector) {
      let searchCollector = new MessageEmbed()
        .setTitle('A message collector is already active in this channel.')
        .setColor('#2ED8BA')
        .setTimestamp();

      return message.channel.send(searchCollector);
    }
    if (!message.member.voice.channel) {
      let searchNoVc = new MessageEmbed()
        .setTitle('You need to join a voice channel first!')
        .setColor('#2ED8BA')
        .setTimestamp();

      return message.channel
        .send(searchNoVc)
        .then((msg) => {
          msg.delete({ timeout: 10000 });
        })
        .catch(console.error);
    }
    const search = args.join(' ');

    let resultsEmbed = new MessageEmbed()
      .setTitle(`**Reply with the song number you want to play**`)
      .setDescription(`Results for: ${search}`)
      .setFooter(`**Reply with the song number you want to play**`)
      .setColor('#2ED8BA');

    try {
      const results = await youtube.searchVideos(search, 10);
      results.map((video, index) =>
        resultsEmbed.addField(video.shortURL, `${index + 1}. ${video.title}`)
      );

      let resultsMessage = await message.channel.send(resultsEmbed);

      function filter(msg) {
        const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/g;
        return pattern.test(msg.content);
      }

      message.channel.activeCollector = true;
      const response = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 30000,
        errors: ['time'],
      });
      const reply = response.first().content;

      if (reply.includes(',')) {
        let songs = reply.split(',').map((str) => str.trim());

        for (let song of songs) {
          await message.client.commands
            .get('play')
            .execute(message, [resultsEmbed.fields[parseInt(song) - 1].name]);
        }
      } else {
        const choice = resultsEmbed.fields[parseInt(response.first()) - 1].name;
        message.client.commands.get('play').execute(message, [choice]);
      }

      message.channel.activeCollector = false;
      resultsMessage.delete().catch(console.error);
      response.first().delete().catch(console.error);
    } catch (error) {
      console.error(error);
      message.channel.activeCollector = false;
      message.reply(error.message).catch(console.error);
    }
  },
};
