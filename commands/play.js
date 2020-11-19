const { play } = require('../include/play');
const ytdl = require('ytdl-core');
const YouTubeAPI = require('simple-youtube-api');
const { MessageEmbed } = require('discord.js');

let YOUTUBE_API_KEY;
try {
  const config = require('../config.json');
  YOUTUBE_API_KEY = config.YOUTUBE_API_KEY;
} catch (error) {
  YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
}
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

module.exports = {
  name: 'play',
  cooldown: 3,
  aliases: ['p'],
  description: 'Plays audio from YouTube or Soundcloud',
  async execute(message, args) {
    const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);
    if (!channel) {
      let noVoice = new MessageEmbed()
        .setTitle('You need to join a voice channel first!')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.reply(noVoice).catch(console.error);
    }
    if (serverQueue && channel !== message.guild.me.voice.channel) {
      let sameChannel = new MessageEmbed()
        .setTitle(`You must be in the same channel as ${message.client.user}`)
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.reply(sameChannel).catch(console.error);
    }
    if (!args.length) {
      let playUsage = new MessageEmbed()
        .setTitle(
          `Usage: ${message.client.prefix}play <YouTube URL | Video Name >`
        )
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.reply(playUsage).catch(console.error);
    }
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) {
      let noConnect = new MessageEmbed()
        .setTitle('Cannot connect to voice channel, missing permissions')
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.reply(noConnect);
    }
    if (!permissions.has('SPEAK')) {
      let noSpeak = new MessageEmbed()
        .setTitle(
          'I cannot speak in this voice channel, make sure I have the proper permissions!'
        )
        .setColor('#2ED8BA')
        .setTimestamp();
      return message.reply(noSpeak);
    }
    const search = args.join(' ');
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    //const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    // Start the playlist if playlist url was provided
    if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
      return message.client.commands.get('playlist').execute(message, args);
    }
    // } else if (scdl.isValidUrl(url) && url.includes('/sets/')) {
    //   return message.client.commands.get('playlist').execute(message, args);
    // }

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 100,
      playing: true,
    };

    let songInfo = null;
    let song = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
      // } else if (scRegex.test(url)) {
      //   try {
      //     const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
      //     song = {
      //       title: trackInfo.title,
      //       url: trackInfo.permalink_url,
      //       duration: Math.ceil(trackInfo.duration / 1000),
      //     };
      //   } catch (error) {
      //     console.error(error);
      //     return message.reply(error.message).catch(console.error);
      //   }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1);
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      let addQueue = new MessageEmbed()
        .setDescription(
          `**${song.title}** has been added to the queue by ${message.author.tag}`
        )
        .setColor('#2ED8BA')
        .setTimestamp();
      return serverQueue.textChannel.send(addQueue).catch(console.error);
    }

    queueConstruct.songs.push(song);
    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      queueConstruct.connection = await channel.join();
      await queueConstruct.connection.voice.setSelfDeaf(true);
      play(queueConstruct.songs[0], message);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return message.channel
        .send(`Could not join the channel: ${error}`)
        .catch(console.error);
    }
  },
};
